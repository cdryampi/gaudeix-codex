"""Serializers for the festes app."""

# pyright: reportAttributeAccessIssue=false

from __future__ import annotations

from rest_framework import serializers
from parler_rest.serializers import TranslatableModelSerializer, TranslatedFieldsField

from core.models import Category, Tag  # pyright: ignore[reportImplicitRelativeImport]
from core.serializers import TagSerializer  # pyright: ignore[reportImplicitRelativeImport]
from media_files.models import (  # pyright: ignore[reportImplicitRelativeImport]
    DocumentFile,
    ImageFile,
)
from media_files.serializers import (  # pyright: ignore[reportImplicitRelativeImport]
    DocumentFileSerializer,
    ImageFileSerializer,
)
from events.serializers import EventSerializer  # pyright: ignore[reportImplicitRelativeImport]
from events.models import Event  # pyright: ignore[reportImplicitRelativeImport]

from .models import Festa, Program, Sponsor, Venue, FestaEvent


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
    festa = serializers.PrimaryKeyRelatedField(read_only=True)
    festa_id = serializers.PrimaryKeyRelatedField(
        queryset=Festa.objects.all(),
        write_only=True,
        required=True,
    )

    class Meta:
        model = Sponsor
        fields = [
            "id",
            "name",
            "logo",
            "logo_id",
            "festa",
            "festa_id",
            "website",
            "tier",
            "order",
        ]

    def create(self, validated_data):
        if "logo_id" in validated_data:
            validated_data["logo"] = validated_data.pop("logo_id")
        festa = validated_data.pop("festa_id", None)
        if festa is not None:
            validated_data["festa"] = festa
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "logo_id" in validated_data:
            validated_data["logo"] = validated_data.pop("logo_id")
        festa = validated_data.pop("festa_id", None)
        if festa is not None:
            validated_data["festa"] = festa
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

    # Posters
    posters = ImageFileSerializer(many=True, read_only=True)
    poster_ids = serializers.PrimaryKeyRelatedField(
        queryset=ImageFile.objects.all(),
        many=True,
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
    events = serializers.SerializerMethodField()
    events_count = serializers.SerializerMethodField()
    event_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )

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
            "posters",
            "poster_ids",
            "program_pdf",
            "program_pdf_id",
            "gallery",
            "gallery_ids",
            "sponsors",
            "events",
            "event_ids",
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
        first_poster = obj.posters.first()
        if first_poster and getattr(first_poster, "file", None):
            return first_poster.file.url
        if obj.featured_media and getattr(obj.featured_media, "file", None):
            return obj.featured_media.file.url
        return ""

    def get_duration_days(self, obj) -> int:
        return obj.duration_days

    def get_events_count(self, obj) -> int:
        return obj.events.count()

    def get_events(self, obj):
        ordered_events = obj.events.order_by("festaevent__order")
        return EventSerializer(ordered_events, many=True, context=self.context).data

    def create(self, validated_data):
        """Handle M2M fields on create."""
        tag_ids = validated_data.pop("tag_ids", [])
        gallery_ids = validated_data.pop("gallery_ids", [])
        poster_ids = validated_data.pop("poster_ids", [])
        event_ids = validated_data.pop("event_ids", None)

        # Handle write-only FK fields
        if "category_id" in validated_data:
            validated_data["category"] = validated_data.pop("category_id")
        if "featured_media_id" in validated_data:
            validated_data["featured_media"] = validated_data.pop("featured_media_id")
        if "program_pdf_id" in validated_data:
            validated_data["program_pdf"] = validated_data.pop("program_pdf_id")

        festa = super().create(validated_data)

        if tag_ids:
            festa.tags.set(tag_ids)
        if gallery_ids:
            festa.gallery.set(gallery_ids)
        if poster_ids:
            festa.posters.set(poster_ids)

        if event_ids is not None:
            festa_events = [
                FestaEvent(festa=festa, event_id=e_id, order=idx)
                for idx, e_id in enumerate(event_ids)
            ]
            FestaEvent.objects.bulk_create(festa_events)

        return festa

    def update(self, instance, validated_data):
        """Handle M2M fields on update."""
        tag_ids = validated_data.pop("tag_ids", None)
        gallery_ids = validated_data.pop("gallery_ids", None)
        poster_ids = validated_data.pop("poster_ids", None)
        event_ids = validated_data.pop("event_ids", None)

        # Handle write-only FK fields
        if "category_id" in validated_data:
            validated_data["category"] = validated_data.pop("category_id")
        if "featured_media_id" in validated_data:
            validated_data["featured_media"] = validated_data.pop("featured_media_id")
        if "program_pdf_id" in validated_data:
            validated_data["program_pdf"] = validated_data.pop("program_pdf_id")

        instance = super().update(instance, validated_data)

        if tag_ids is not None:
            instance.tags.set(tag_ids)
        if gallery_ids is not None:
            instance.gallery.set(gallery_ids)
        if poster_ids is not None:
            instance.posters.set(poster_ids)

        if event_ids is not None:
            instance.festaevent_set.all().delete()
            festa_events = [
                FestaEvent(festa=instance, event_id=e_id, order=idx)
                for idx, e_id in enumerate(event_ids)
            ]
            FestaEvent.objects.bulk_create(festa_events)

        return instance


class FestaDetailSerializer(FestaSerializer):
    """Serializer for Festa detail view with events."""

    events = EventSerializer(many=True, read_only=True)

    class Meta(FestaSerializer.Meta):
        fields = FestaSerializer.Meta.fields + ["events"]


class VenueTranslationSerializer(serializers.Serializer):
    """Serializer for Venue translated fields."""

    name = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True)


class VenueSerializer(TranslatableModelSerializer):
    """Serializer for Venue list and create operations."""

    translations = TranslatedFieldsField(
        shared_model=Venue,
        serializer_class=VenueTranslationSerializer,
        required=False,
    )

    # Computed field
    location = serializers.SerializerMethodField()

    class Meta:
        model = Venue
        fields = [
            "id",
            "slug",
            "name",
            "description",
            "address",
            "postal_code",
            "city",
            "latitude",
            "longitude",
            "is_published",
            "is_accessible",
            "location",
            "created_at",
            "updated_at",
            "translations",
        ]
        read_only_fields = ["id", "slug", "location", "created_at", "updated_at"]

    def get_location(self, obj) -> str:
        """Return computed location from address and city."""
        return obj.location


class ProgramTranslationSerializer(serializers.Serializer):
    """Serializer for Program translated fields."""

    title = serializers.CharField(max_length=200)
    subtitle = serializers.CharField(required=False, allow_blank=True, max_length=300)
    description = serializers.CharField(required=False, allow_blank=True)


class ProgramSerializer(TranslatableModelSerializer):
    """Serializer for Program list/create/update operations."""

    translations = TranslatedFieldsField(
        shared_model=Program,
        serializer_class=ProgramTranslationSerializer,
        required=False,
    )

    festa = serializers.PrimaryKeyRelatedField(read_only=True)
    festa_id = serializers.PrimaryKeyRelatedField(
        queryset=Festa.objects.all(),
        write_only=True,
        required=False,
    )
    festa_slug = serializers.SerializerMethodField()
    is_published = serializers.ReadOnlyField()

    class Meta:
        model = Program
        fields = [
            "id",
            "slug",
            "festa",
            "festa_id",
            "festa_slug",
            "title",
            "subtitle",
            "description",
            "status",
            "is_published",
            "order",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
            "translations",
        ]
        read_only_fields = [
            "id",
            "slug",
            "festa",
            "festa_slug",
            "is_published",
            "created_at",
            "updated_at",
        ]

    def get_festa_slug(self, obj) -> str:
        return obj.festa.slug if obj.festa else ""

    def create(self, validated_data):
        festa = validated_data.pop("festa_id", None)
        if festa is not None:
            validated_data["festa"] = festa
        return super().create(validated_data)

    def update(self, instance, validated_data):
        festa = validated_data.pop("festa_id", None)
        if festa is not None:
            validated_data["festa"] = festa
        return super().update(instance, validated_data)


