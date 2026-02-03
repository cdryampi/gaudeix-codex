"""Serializers for the routes app."""

from __future__ import annotations

from django.conf import settings
from rest_framework import serializers
from parler_rest.serializers import TranslatableModelSerializer, TranslatedFieldsField

from core.models import Category, Tag
from core.serializers import TagSerializer
from media_files.models import DocumentFile, ImageFile
from media_files.serializers import DocumentFileSerializer, ImageFileSerializer

from .models import Route, RouteWaypoint


class RouteTranslationSerializer(serializers.Serializer):
    """Serializer for Route translated fields."""

    title = serializers.CharField(max_length=200)
    summary = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    instructions = serializers.CharField(required=False, allow_blank=True)


class RouteWaypointSerializer(serializers.ModelSerializer):
    """Serializer for RouteWaypoint through model."""

    place_id = serializers.IntegerField(source="place.id", read_only=True)
    place_slug = serializers.CharField(source="place.slug", read_only=True)
    place_title = serializers.SerializerMethodField()

    class Meta:
        model = RouteWaypoint
        fields = [
            "id",
            "place_id",
            "place_slug",
            "place_title",
            "order",
            "instructions",
            "distance_from_previous_km",
        ]

    def get_place_title(self, obj) -> str:
        return obj.place.safe_translation_getter("title", any_language=True) or ""


class RouteSerializer(TranslatableModelSerializer):
    """Serializer for Route list and create operations."""

    translations = TranslatedFieldsField(
        shared_model=Route,
        serializer_class=RouteTranslationSerializer,
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

    # GPX file
    gpx_file = DocumentFileSerializer(read_only=True)
    gpx_file_id = serializers.PrimaryKeyRelatedField(
        queryset=DocumentFile.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )

    # Attachments
    attachments = DocumentFileSerializer(many=True, read_only=True)
    attachments_ids = serializers.PrimaryKeyRelatedField(
        queryset=DocumentFile.objects.all(),
        many=True,
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

    # Computed fields
    image_url = serializers.SerializerMethodField()
    duration_formatted = serializers.SerializerMethodField()
    waypoints_list = RouteWaypointSerializer(
        source="route_waypoints", many=True, read_only=True
    )

    class Meta:
        model = Route
        fields = [
            "id",
            "slug",
            "category",
            "category_id",
            "category_slug",
            "category_name",
            "title",
            "summary",
            "description",
            "instructions",
            "route_type",
            "difficulty",
            "distance_km",
            "duration_minutes",
            "duration_formatted",
            "elevation_gain",
            "elevation_loss",
            "start_latitude",
            "start_longitude",
            "end_latitude",
            "end_longitude",
            "is_circular",
            "is_published",
            "is_featured",
            "tags",
            "tag_ids",
            "featured_media",
            "featured_media_id",
            "gpx_file",
            "gpx_file_id",
            "track_geojson",
            "attachments",
            "attachments_ids",
            "gallery",
            "gallery_ids",
            "image_url",
            "waypoints_list",
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
        if obj.featured_media and obj.featured_media.file:
            return obj.featured_media.file.url
        return ""

    def get_duration_formatted(self, obj) -> str:
        return obj.duration_formatted

    def create(self, validated_data):
        """Handle M2M fields on create."""
        tag_ids = validated_data.pop("tag_ids", [])
        attachments_ids = validated_data.pop("attachments_ids", [])
        gallery_ids = validated_data.pop("gallery_ids", [])

        # Handle write-only FK fields
        if "category_id" in validated_data:
            validated_data["category"] = validated_data.pop("category_id")
        if "featured_media_id" in validated_data:
            validated_data["featured_media"] = validated_data.pop("featured_media_id")
        if "gpx_file_id" in validated_data:
            validated_data["gpx_file"] = validated_data.pop("gpx_file_id")

        route = super().create(validated_data)

        if tag_ids:
            route.tags.set(tag_ids)
        if attachments_ids:
            route.attachments.set(attachments_ids)
        if gallery_ids:
            route.gallery.set(gallery_ids)

        return route

    def update(self, instance, validated_data):
        """Handle M2M fields on update."""
        tag_ids = validated_data.pop("tag_ids", None)
        attachments_ids = validated_data.pop("attachments_ids", None)
        gallery_ids = validated_data.pop("gallery_ids", None)

        # Handle write-only FK fields
        if "category_id" in validated_data:
            validated_data["category"] = validated_data.pop("category_id")
        if "featured_media_id" in validated_data:
            validated_data["featured_media"] = validated_data.pop("featured_media_id")
        if "gpx_file_id" in validated_data:
            validated_data["gpx_file"] = validated_data.pop("gpx_file_id")

        instance = super().update(instance, validated_data)

        if tag_ids is not None:
            instance.tags.set(tag_ids)
        if attachments_ids is not None:
            instance.attachments.set(attachments_ids)
        if gallery_ids is not None:
            instance.gallery.set(gallery_ids)

        return instance


class RouteDetailSerializer(RouteSerializer):
    """Serializer for Route detail view with additional fields."""

    pass
