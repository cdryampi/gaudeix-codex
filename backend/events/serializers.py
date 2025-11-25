from __future__ import annotations

from django.conf import settings
from rest_framework import serializers
from parler_rest.serializers import TranslatableModelSerializer, TranslatedFieldsField

from media_files.models import DocumentFile, ImageFile
from media_files.serializers import DocumentFileSerializer, ImageFileSerializer

from .models import Event


class EventTranslationSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True)


class EventSerializer(TranslatableModelSerializer):
    translations = TranslatedFieldsField(
        shared_model=Event,
        serializer_class=EventTranslationSerializer,
        required=False,
    )
    featured_media = ImageFileSerializer(read_only=True)
    featured_media_id = serializers.PrimaryKeyRelatedField(
        queryset=ImageFile.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )
    attachments = DocumentFileSerializer(many=True, read_only=True)
    attachments_ids = serializers.PrimaryKeyRelatedField(
        queryset=DocumentFile.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )
    is_future = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "start_at",
            "end_at",
            "is_published",
            "location_text",
            "featured_media",
            "featured_media_id",
            "attachments",
            "attachments_ids",
            "created_at",
            "updated_at",
            "is_future",
            "translations",
        ]
        read_only_fields = [
            "id",
            "slug",
            "created_at",
            "updated_at",
            "is_future",
            "featured_media",
            "attachments",
        ]

    def get_is_future(self, obj: Event) -> bool:
        return obj.is_future()

    def save(self, **kwargs):
        translated_data = self._pop_translated_data()
        base_language = settings.LANGUAGE_CODE
        base_values = {}
        if "title" in self.initial_data:
            base_values["title"] = self.initial_data.get("title")
        if "description" in self.initial_data:
            base_values["description"] = self.initial_data.get("description")
        if base_values:
            translations = translated_data.get("translations") or {}
            translations[base_language] = {
                **translations.get(base_language, {}),
                **base_values,
            }
            translated_data["translations"] = translations

        instance = serializers.ModelSerializer.save(self, **kwargs)
        self.save_translations(instance, translated_data)
        return instance

    def create(self, validated_data):
        attachments = validated_data.pop("attachments_ids", [])
        translations_data = validated_data.pop("translations", None)
        base_language = settings.LANGUAGE_CODE
        title = validated_data.pop("title", None) or self.initial_data.get("title")
        description = validated_data.pop("description", None) or self.initial_data.get("description")
        featured_media = validated_data.pop("featured_media_id", None)

        # Backward compatibility: allow featured_media / attachments keys as in tests
        if featured_media is None and self.initial_data.get("featured_media"):
            featured_media = ImageFile.objects.filter(
                pk=self.initial_data.get("featured_media")
            ).first()
        if not attachments and self.initial_data.get("attachments"):
            attachments = list(
                DocumentFile.objects.filter(pk__in=self.initial_data.get("attachments"))
            )

        instance = Event()
        instance.set_current_language(base_language)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if title is not None:
            instance.title = title
        if description is not None:
            instance.description = description

        instance.save()
        if featured_media is not None:
            instance.featured_media = featured_media
            instance.save()

        if translations_data:
            self._apply_translations(instance, translations_data, skip_language=base_language)
            instance.set_current_language(base_language)
        if title is not None or description is not None:
            if title is not None:
                instance.title = title
            if description is not None:
                instance.description = description
            instance.save()
        if attachments:
            instance.attachments.set(attachments)
        return instance

    def update(self, instance, validated_data):
        attachments = validated_data.pop("attachments_ids", None)
        translations_data = validated_data.pop("translations", None)
        base_language = settings.LANGUAGE_CODE
        title = validated_data.pop("title", None) or self.initial_data.get("title")
        description = validated_data.pop("description", None) or self.initial_data.get("description")
        featured_media = validated_data.pop("featured_media_id", None)
        if featured_media is None and self.initial_data.get("featured_media"):
            featured_media = ImageFile.objects.filter(
                pk=self.initial_data.get("featured_media")
            ).first()
        if attachments is None and self.initial_data.get("attachments"):
            attachments = list(
                DocumentFile.objects.filter(pk__in=self.initial_data.get("attachments"))
            )
        instance.set_current_language(base_language)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if title is not None:
            instance.title = title
        if description is not None:
            instance.description = description

        instance.save()
        if featured_media is not None:
            instance.featured_media = featured_media
            instance.save()
        if translations_data:
            self._apply_translations(instance, translations_data, skip_language=base_language)
            instance.set_current_language(base_language)
        if title is not None or description is not None:
            if title is not None:
                instance.title = title
            if description is not None:
                instance.description = description
            instance.save()
        if attachments is not None:
            instance.attachments.set(attachments)
        return instance

    def _apply_translations(self, instance: Event, translations: dict, skip_language: str | None = None) -> None:
        for language_code, values in translations.items():
            if skip_language and language_code == skip_language:
                continue
            instance.set_current_language(language_code)
            for field, value in values.items():
                setattr(instance, field, value)
            instance.save()


class EventDetailSerializer(EventSerializer):
    featured_media = ImageFileSerializer(read_only=True)
    attachments = DocumentFileSerializer(many=True, read_only=True)

    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields
