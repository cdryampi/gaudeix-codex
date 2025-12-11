from __future__ import annotations

from django.conf import settings
from rest_framework import serializers
from parler_rest.serializers import TranslatableModelSerializer, TranslatedFieldsField

from .models import Category


class CategoryTranslationSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=150)
    descripcion = serializers.CharField(required=False, allow_blank=True)


class CategorySerializer(TranslatableModelSerializer):
    translations = TranslatedFieldsField(
        shared_model=Category,
        serializer_class=CategoryTranslationSerializer,
        required=False,
    )
    created_at = serializers.DateTimeField(source="fecha_creacion", read_only=True)
    updated_at = serializers.DateTimeField(source="fecha_modificacion", read_only=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "slug",
            "taxonomy",
            "icon",
            "nombre",
            "descripcion",
            "translations",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def save(self, **kwargs):
        translated_data = self._pop_translated_data()
        base_language = settings.LANGUAGE_CODE
        base_values = {}
        if "nombre" in self.initial_data:
            base_values["nombre"] = self.initial_data.get("nombre")
        if "descripcion" in self.initial_data:
            base_values["descripcion"] = self.initial_data.get("descripcion")
        if base_values:
            translations = translated_data.get("translations") or {}
            translations[base_language] = {**translations.get(base_language, {}), **base_values}
            translated_data["translations"] = translations

        instance = serializers.ModelSerializer.save(self, **kwargs)
        self.save_translations(instance, translated_data)
        return instance

    def create(self, validated_data):
        translations_data = validated_data.pop("translations", None)
        base_language = settings.LANGUAGE_CODE
        nombre = validated_data.pop("nombre", None) or self.initial_data.get("nombre")
        descripcion = validated_data.pop("descripcion", None) or self.initial_data.get("descripcion")

        instance = Category()
        instance.set_current_language(base_language)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if nombre is not None:
            instance.nombre = nombre
        if descripcion is not None:
            instance.descripcion = descripcion

        instance.save()

        if translations_data:
            self._apply_translations(instance, translations_data, skip_language=base_language)
            instance.set_current_language(base_language)
        if nombre is not None or descripcion is not None:
            if nombre is not None:
                instance.nombre = nombre
            if descripcion is not None:
                instance.descripcion = descripcion
            instance.save()
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop("translations", None)
        base_language = settings.LANGUAGE_CODE
        nombre = validated_data.pop("nombre", None) or self.initial_data.get("nombre")
        descripcion = validated_data.pop("descripcion", None) or self.initial_data.get("descripcion")

        instance.set_current_language(base_language)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if nombre is not None:
            instance.nombre = nombre
        if descripcion is not None:
            instance.descripcion = descripcion

        instance.save()
        if translations_data:
            self._apply_translations(instance, translations_data, skip_language=base_language)
            instance.set_current_language(base_language)
        if nombre is not None or descripcion is not None:
            if nombre is not None:
                instance.nombre = nombre
            if descripcion is not None:
                instance.descripcion = descripcion
            instance.save()
        return instance

    def _apply_translations(self, instance: Category, translations: dict, skip_language: str | None = None) -> None:
        for language_code, values in translations.items():
            if skip_language and language_code == skip_language:
                continue
            instance.set_current_language(language_code)
            for field, value in values.items():
                setattr(instance, field, value)
            instance.save()
