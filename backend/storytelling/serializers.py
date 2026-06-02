from __future__ import annotations

from django.conf import settings
from rest_framework import serializers
from parler_rest.serializers import TranslatableModelSerializer, TranslatedFieldsField

from core.models import Category
from media_files.models import DocumentFile, ImageFile
from media_files.serializers import DocumentFileSerializer, ImageFileSerializer
from .models import Story


class StoryTranslationSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    summary = serializers.CharField(required=False, allow_blank=True)
    content = serializers.CharField(required=False, allow_blank=True)
    audio_file = DocumentFileSerializer(read_only=True)
    audio_file_id = serializers.PrimaryKeyRelatedField(
        queryset=DocumentFile.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
        source="audio_file",
    )


class StorySerializer(TranslatableModelSerializer):
    translations = TranslatedFieldsField(
        shared_model=Story,
        serializer_class=StoryTranslationSerializer,
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
    category = serializers.PrimaryKeyRelatedField(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )
    audio_file = DocumentFileSerializer(read_only=True)
    audio_file_id = serializers.PrimaryKeyRelatedField(
        queryset=DocumentFile.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
        source="audio_file",
    )

    class Meta:
        model = Story
        fields = [
            "id",
            "slug",
            "title",
            "summary",
            "content",
            "audio_file",
            "audio_file_id",
            "is_published",
            "historical_period",
            "reading_time",
            "difficulty",
            "category",
            "category_id",
            "featured_media",
            "featured_media_id",
            "attachments",
            "attachments_ids",
            "source_url",
            "source_name",
            "created_at",
            "updated_at",
            "translations",
        ]
        read_only_fields = [
            "id",
            "slug",
            "created_at",
            "updated_at",
            "featured_media",
            "attachments",
            "category",
        ]

    def save(self, **kwargs):
        translated_data = self._pop_translated_data()
        base_language = settings.LANGUAGE_CODE
        base_values = {}
        for field in ["title", "summary", "content"]:
            if field in self.initial_data:
                base_values[field] = self.initial_data.get(field)
        if "audio_file_id" in self.initial_data:
            audio_id = self.initial_data.get("audio_file_id")
            base_values["audio_file"] = DocumentFile.objects.filter(pk=audio_id).first() if audio_id else None
        elif "audio_file" in self.initial_data:
            base_values["audio_file"] = self.initial_data.get("audio_file")

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
        category = validated_data.pop("category_id", None)
        base_language = settings.LANGUAGE_CODE

        title = validated_data.pop("title", None) or self.initial_data.get("title")
        summary = validated_data.pop("summary", None) or self.initial_data.get("summary")
        content = validated_data.pop("content", None) or self.initial_data.get("content")
        audio_file = validated_data.pop("audio_file", None)
        if audio_file is None and self.initial_data.get("audio_file_id"):
            audio_file = DocumentFile.objects.filter(pk=self.initial_data.get("audio_file_id")).first()

        featured_media = validated_data.pop("featured_media_id", None)

        if featured_media is None and self.initial_data.get("featured_media"):
            featured_media = ImageFile.objects.filter(
                pk=self.initial_data.get("featured_media")
            ).first()
        if not attachments and self.initial_data.get("attachments"):
            attachments = list(
                DocumentFile.objects.filter(pk__in=self.initial_data.get("attachments"))
            )

        ModelClass = self.Meta.model
        instance = ModelClass()
        instance.set_current_language(base_language)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if category is not None:
            instance.category = category
        if title is not None:
            instance.title = title
        if summary is not None:
            instance.summary = summary
        if content is not None:
            instance.content = content
        if audio_file is not None:
            instance.audio_file = audio_file

        instance.save()
        if featured_media is not None:
            instance.featured_media = featured_media
            instance.save()

        if translations_data:
            self._apply_translations(
                instance, translations_data, skip_language=base_language
            )
            instance.set_current_language(base_language)
        
        # Save again with base language
        instance.set_current_language(base_language)
        if title is not None:
            instance.title = title
        if summary is not None:
            instance.summary = summary
        if content is not None:
            instance.content = content
        if audio_file is not None:
            instance.audio_file = audio_file
        instance.save()

        if attachments:
            instance.attachments.set(attachments)
        return instance

    def update(self, instance, validated_data):
        attachments = validated_data.pop("attachments_ids", None)
        translations_data = validated_data.pop("translations", None)
        category = validated_data.pop("category_id", None)
        base_language = settings.LANGUAGE_CODE

        title = validated_data.pop("title", None) or self.initial_data.get("title")
        summary = validated_data.pop("summary", None) or self.initial_data.get("summary")
        content = validated_data.pop("content", None) or self.initial_data.get("content")
        audio_file = validated_data.pop("audio_file", None)
        if audio_file is None and self.initial_data.get("audio_file_id"):
            audio_file = DocumentFile.objects.filter(pk=self.initial_data.get("audio_file_id")).first()

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
        if category is not None:
            instance.category = category
        if title is not None:
            instance.title = title
        if summary is not None:
            instance.summary = summary
        if content is not None:
            instance.content = content
        if audio_file is not None:
            instance.audio_file = audio_file

        instance.save()
        if featured_media is not None:
            instance.featured_media = featured_media
            instance.save()
        if translations_data:
            self._apply_translations(
                instance, translations_data, skip_language=base_language
            )
            instance.set_current_language(base_language)

        instance.set_current_language(base_language)
        if title is not None:
            instance.title = title
        if summary is not None:
            instance.summary = summary
        if content is not None:
            instance.content = content
        if audio_file is not None:
            instance.audio_file = audio_file
        instance.save()

        if attachments is not None:
            instance.attachments.set(attachments)
        return instance

    def _apply_translations(
        self, instance: Story, translations: dict, skip_language: str | None = None
    ) -> None:
        for language_code, values in translations.items():
            if skip_language and language_code == skip_language:
                continue
            instance.set_current_language(language_code)
            for field, value in values.items():
                setattr(instance, field, value)
            instance.save()
