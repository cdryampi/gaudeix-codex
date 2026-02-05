from django.conf import settings
from rest_framework import serializers
from parler_rest.serializers import TranslatableModelSerializer, TranslatedFieldsField
from media_files.serializers import ImageFileSerializer, DocumentFileSerializer
from media_files.models import ImageFile, DocumentFile
from core.models import Category
from .models import News


class NewsTranslationSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    summary = serializers.CharField(required=False, allow_blank=True)
    body = serializers.CharField(required=False, allow_blank=True)


class NewsSerializer(TranslatableModelSerializer):
    translations = TranslatedFieldsField(
        shared_model=News,
        serializer_class=NewsTranslationSerializer,
        required=False,
    )
    category = serializers.PrimaryKeyRelatedField(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
        source="category",
    )
    category_slug = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    featured_media = ImageFileSerializer(read_only=True)
    featured_media_id = serializers.PrimaryKeyRelatedField(
        queryset=ImageFile.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
        source="featured_media",
    )
    image_url = serializers.SerializerMethodField()

    # Attachments (PDF documents)
    attachments = DocumentFileSerializer(many=True, read_only=True)
    attachments_ids = serializers.PrimaryKeyRelatedField(
        queryset=DocumentFile.objects.all(),
        many=True,
        required=False,
        write_only=True,
        source="attachments",
    )

    class Meta:
        model = News
        fields = [
            "id",
            "slug",
            "title",
            "summary",
            "body",
            "is_published",
            "is_featured",
            "published_at",
            "category",
            "category_id",
            "category_slug",
            "category_name",
            "featured_media",
            "featured_media_id",
            "image_url",
            "attachments",
            "attachments_ids",
            "translations",
            "fecha_creacion",
            "fecha_modificacion",
        ]
        read_only_fields = [
            "id",
            "slug",
            "image_url",
            "category_slug",
            "category_name",
            "fecha_creacion",
            "fecha_modificacion",
        ]

    def get_category_slug(self, obj: News) -> str:
        if obj.category_id and obj.category:
            return obj.category.slug
        return ""

    def get_category_name(self, obj: News) -> str:
        if obj.category_id and obj.category:
            return obj.category.nombre
        return ""

    def get_image_url(self, obj: News) -> str:
        if not obj.featured_media_id:
            return ""
        return obj.featured_media.file.url if obj.featured_media.file else ""

    def save(self, **kwargs):
        # Handle top-level fields for base language automatically if sent in root
        base_lang = settings.LANGUAGE_CODE
        for field in ["title", "summary", "body"]:
            if field in self.initial_data and not self.initial_data.get(
                "translations", {}
            ).get(base_lang, {}).get(field):
                if "translations" not in self.validated_data:
                    self.validated_data["translations"] = {}
                if base_lang not in self.validated_data["translations"]:
                    self.validated_data["translations"][base_lang] = {}
                self.validated_data["translations"][base_lang][field] = (
                    self.initial_data[field]
                )

        return super().save(**kwargs)
