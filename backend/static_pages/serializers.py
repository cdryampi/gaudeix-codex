from __future__ import annotations

from django.conf import settings
from rest_framework import serializers
from parler_rest.serializers import TranslatableModelSerializer, TranslatedFieldsField

from .models import StaticPage
from media_files.serializers import DocumentFileSerializer, ImageFileSerializer


class StaticPageTranslationSerializer(serializers.Serializer):
    titulo = serializers.CharField(max_length=200)
    cuerpo = serializers.CharField(required=False, allow_blank=True)


class StaticPageSerializer(TranslatableModelSerializer):
    translations = TranslatedFieldsField(
        shared_model=StaticPage,
        serializer_class=StaticPageTranslationSerializer,
        required=False,
    )
    featured_media = ImageFileSerializer(read_only=True)
    featured_media_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    attachment = DocumentFileSerializer(read_only=True)
    attachment_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    created_at = serializers.DateTimeField(source="fecha_creacion", read_only=True)
    updated_at = serializers.DateTimeField(source="fecha_modificacion", read_only=True)

    class Meta:
        model = StaticPage
        fields = [
            "id",
            "slug",
            "template",
            "is_published",
            "featured_media",
            "featured_media_id",
            "attachment",
            "attachment_id",
            "titulo",
            "cuerpo",
            "translations",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "featured_media", "attachment"]

    def validate(self, attrs):
        # Ensure template uniqueness by serializer (DB also enforces unique=True)
        template = attrs.get("template") or getattr(self.instance, "template", None)
        if template and not self.instance:
            if StaticPage.objects.filter(template=template).exists():
                raise serializers.ValidationError({"template": "Ya existe una página con esta plantilla."})
        return attrs

    def save(self, **kwargs):
        translated_data = self._pop_translated_data()
        base_language = settings.LANGUAGE_CODE
        base_values = {}
        if "titulo" in self.initial_data:
            base_values["titulo"] = self.initial_data.get("titulo")
        if "cuerpo" in self.initial_data:
            base_values["cuerpo"] = self.initial_data.get("cuerpo")
        if base_values:
            translations = translated_data.get("translations") or {}
            translations[base_language] = {**translations.get(base_language, {}), **base_values}
            translated_data["translations"] = translations

        instance = serializers.ModelSerializer.save(self, **kwargs)
        self.save_translations(instance, translated_data)
        return instance

    def create(self, validated_data):
        translations_data = validated_data.pop("translations", None)
        featured_media_id = validated_data.pop("featured_media_id", None)
        attachment_id = validated_data.pop("attachment_id", None)
        base_language = settings.LANGUAGE_CODE
        titulo = validated_data.pop("titulo", None) or self.initial_data.get("titulo")
        cuerpo = validated_data.pop("cuerpo", None) or self.initial_data.get("cuerpo")

        instance = StaticPage()
        instance.set_current_language(base_language)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if titulo is not None:
            instance.titulo = titulo
        if cuerpo is not None:
            instance.cuerpo = cuerpo
        if featured_media_id:
            instance.featured_media_id = featured_media_id
        if attachment_id:
            instance.attachment_id = attachment_id
        instance.save()

        if translations_data:
            self._apply_translations(instance, translations_data, skip_language=base_language)
            instance.set_current_language(base_language)
        if titulo is not None or cuerpo is not None:
            if titulo is not None:
                instance.titulo = titulo
            if cuerpo is not None:
                instance.cuerpo = cuerpo
            instance.save()
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop("translations", None)
        featured_media_id = validated_data.pop("featured_media_id", None)
        attachment_id = validated_data.pop("attachment_id", None)
        base_language = settings.LANGUAGE_CODE
        titulo = validated_data.pop("titulo", None) or self.initial_data.get("titulo")
        cuerpo = validated_data.pop("cuerpo", None) or self.initial_data.get("cuerpo")

        instance.set_current_language(base_language)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if titulo is not None:
            instance.titulo = titulo
        if cuerpo is not None:
            instance.cuerpo = cuerpo
        if featured_media_id is not None:
            instance.featured_media_id = featured_media_id
        if attachment_id is not None:
            instance.attachment_id = attachment_id

        instance.save()
        if translations_data:
            self._apply_translations(instance, translations_data, skip_language=base_language)
            instance.set_current_language(base_language)
        if titulo is not None or cuerpo is not None:
            if titulo is not None:
                instance.titulo = titulo
            if cuerpo is not None:
                instance.cuerpo = cuerpo
            instance.save()
        return instance

    def _apply_translations(self, instance: StaticPage, translations: dict, skip_language: str | None = None) -> None:
        for language_code, values in translations.items():
            if skip_language and language_code == skip_language:
                continue
            instance.set_current_language(language_code)
            for field, value in values.items():
                setattr(instance, field, value)
            instance.save()
