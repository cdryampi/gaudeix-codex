"""Serializers for the festes app."""

from __future__ import annotations

from django.conf import settings
from rest_framework import serializers
from parler_rest.serializers import TranslatableModelSerializer, TranslatedFieldsField

from core.models import Category, Tag
from core.serializers import TagSerializer
from media_files.models import DocumentFile, ImageFile
from media_files.serializers import DocumentFileSerializer, ImageFileSerializer
from events.serializers import EventSerializer

from .models import Festa, Sponsor


class FestaTranslationSerializer(serializers.Serializer):
    """Serializer for Festa translated fields."""

    title = serializers.CharField(max_length=200)
    subtitle = serializers.CharField(required=False, allow_blank=True, max_length=300)
    summary = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    program_text = serializers.CharField(required=False, allow_blank=True)


class SponsorSerializer(serializers.ModelSerializer):
    """Serializer for Sponsor model."""

    logo = ImageFileSerializer(read_only=True)
    logo_id = serializers.PrimaryKeyRelatedField(
        queryset=ImageFile.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )

    class Meta:
        model = Sponsor
        fields = [
            "id",
            "name",
            "logo",
            "logo_id",
            "website",
            "tier",
            "order",
        ]

    def create(self, validated_data):
        if "logo_id" in validated_data:
            validated_data["logo"] = validated_data.pop("logo_id")
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "logo_id" in validated_data:
            validated_data["logo"] = validated_data.pop("logo_id")
        return super().update(instance, validated_data)


class FestaSerializer(TranslatableModelSerializer):
    """Serializer for Festa list and create operations."""

    translations = TranslatedFieldsField(
        shared_model=Festa,
        serializer_class=FestaTranslationSerializer,
        required=False,
    )

    # Category
    category = serializers.PrimaryKeyRelatedField(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )
    category_slug = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()

    # Tags
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )

    # Featured media
    featured_media = ImageFileSerializer(read_only=True)
    featured_media_id = serializers.PrimaryKeyRelatedField(
        queryset=ImageFile.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )

    # Poster
    poster = ImageFileSerializer(read_only=True)
    poster_id = serializers.PrimaryKeyRelatedField(
        queryset=ImageFile.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )

    # Program PDF
    program_pdf = DocumentFileSerializer(read_only=True)
    program_pdf_id = serializers.PrimaryKeyRelatedField(
        queryset=DocumentFile.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )

    # Gallery
    gallery = ImageFileSerializer(many=True, read_only=True)
    gallery_ids = serializers.PrimaryKeyRelatedField(
        queryset=ImageFile.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )

    # Sponsors
    sponsors = SponsorSerializer(many=True, read_only=True)

    # Events
    events_count = serializers.SerializerMethodField()

    # Computed fields
    image_url = serializers.SerializerMethodField()
    duration_days = serializers.SerializerMethodField()

    class Meta:
        model = Festa
        fields = [
            "id",
            "slug",
            "category",
            "category_id",
            "category_slug",
            "category_name",
            "title",
            "subtitle",
            "summary",
            "description",
            "program_text",
            "start_date",
            "end_date",
            "year",
            "is_published",
            "is_featured",
            "is_current",
            "tags",
            "tag_ids",
            "featured_media",
            "featured_media_id",
            "poster",
            "poster_id",
            "program_pdf",
            "program_pdf_id",
            "gallery",
            "gallery_ids",
            "sponsors",
            "events_count",
            "image_url",
            "duration_days",
            "created_at",
            "updated_at",
            "translations",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

    def get_category_slug(self, obj) -> str:
        return obj.category.slug if obj.category else ""

    def get_category_name(self, obj) -> str:
        if obj.category:
            return (
                obj.category.safe_translation_getter("nombre", any_language=True) or ""
            )
        return ""

    def get_image_url(self, obj) -> str:
        # Prefer poster, fallback to featured_media
        if obj.poster and obj.poster.file:
            return obj.poster.file.url
        if obj.featured_media and obj.featured_media.file:
            return obj.featured_media.file.url
        return ""

    def get_duration_days(self, obj) -> int:
        return obj.duration_days

    def get_events_count(self, obj) -> int:
        return obj.events.count()

    def create(self, validated_data):
        """Handle M2M fields on create."""
        tag_ids = validated_data.pop("tag_ids", [])
        gallery_ids = validated_data.pop("gallery_ids", [])

        # Handle write-only FK fields
        if "category_id" in validated_data:
            validated_data["category"] = validated_data.pop("category_id")
        if "featured_media_id" in validated_data:
            validated_data["featured_media"] = validated_data.pop("featured_media_id")
        if "poster_id" in validated_data:
            validated_data["poster"] = validated_data.pop("poster_id")
        if "program_pdf_id" in validated_data:
            validated_data["program_pdf"] = validated_data.pop("program_pdf_id")

        festa = super().create(validated_data)

        if tag_ids:
            festa.tags.set(tag_ids)
        if gallery_ids:
            festa.gallery.set(gallery_ids)

        return festa

    def update(self, instance, validated_data):
        """Handle M2M fields on update."""
        tag_ids = validated_data.pop("tag_ids", None)
        gallery_ids = validated_data.pop("gallery_ids", None)

        # Handle write-only FK fields
        if "category_id" in validated_data:
            validated_data["category"] = validated_data.pop("category_id")
        if "featured_media_id" in validated_data:
            validated_data["featured_media"] = validated_data.pop("featured_media_id")
        if "poster_id" in validated_data:
            validated_data["poster"] = validated_data.pop("poster_id")
        if "program_pdf_id" in validated_data:
            validated_data["program_pdf"] = validated_data.pop("program_pdf_id")

        instance = super().update(instance, validated_data)

        if tag_ids is not None:
            instance.tags.set(tag_ids)
        if gallery_ids is not None:
            instance.gallery.set(gallery_ids)

        return instance


class FestaDetailSerializer(FestaSerializer):
    """Serializer for Festa detail view with events."""

    events = EventSerializer(many=True, read_only=True)

    class Meta(FestaSerializer.Meta):
        fields = FestaSerializer.Meta.fields + ["events"]
