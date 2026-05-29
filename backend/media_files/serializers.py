from __future__ import annotations

from django.core.files.storage import default_storage
from rest_framework import serializers

from . import utils
from .models import DocumentFile, ImageFile, VideoFile


def build_media_url(path: object, request=None) -> str:
    if not path:
        return ""

    value = getattr(path, "name", path)
    if not value:
        return ""

    url = str(value)
    if not (url.startswith("http://") or url.startswith("https://") or url.startswith("/")):
        try:
            url = default_storage.url(url)
        except Exception:
            url = f"/media/{url.lstrip('/')}"

    if request and url.startswith("/"):
        try:
            return request.build_absolute_uri(url)
        except Exception:
            return url
    return url


class ImageFileSerializer(serializers.ModelSerializer):
    """Serializer para ImageFile con validaciones y URLs absolutas para variantes."""

    thumbnail_url = serializers.SerializerMethodField()
    original_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = ImageFile
        fields = [
            "id",
            "file",
            "original_name",
            "mime_type",
            "size_bytes",
            "variant_thumbnail",
            "variant_medium",
            "variant_large",
            "thumbnail_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "mime_type",
            "size_bytes",
            "variant_thumbnail",
            "variant_medium",
            "variant_large",
            "thumbnail_url",
            "created_at",
            "updated_at",
        ]

    def validate_file(self, value):
        utils.validate_max_file_size(value)
        utils.validate_image_extension(value)
        return value

    def create(self, validated_data):
        file = validated_data.get("file")
        if file:
            validated_data["original_name"] = file.name
            validated_data["mime_type"] = getattr(file, "content_type", "") or ""
            validated_data["size_bytes"] = file.size
        return super().create(validated_data)

    def get_thumbnail_url(self, obj: ImageFile) -> str:
        return build_media_url(obj.variant_thumbnail, self.context.get("request"))

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get("request")

        rep["file"] = build_media_url(instance.file, request)
        rep["variant_thumbnail"] = build_media_url(instance.variant_thumbnail, request)
        rep["variant_medium"] = build_media_url(instance.variant_medium, request)
        rep["variant_large"] = build_media_url(instance.variant_large, request)
        return rep


class DocumentFileSerializer(serializers.ModelSerializer):
    """Serializer para DocumentFile con validaciones básicas."""

    original_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = DocumentFile
        fields = [
            "id",
            "file",
            "original_name",
            "mime_type",
            "size_bytes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "mime_type",
            "size_bytes",
            "created_at",
            "updated_at",
        ]

    def validate_file(self, value):
        utils.validate_max_file_size(value)
        utils.validate_document_extension(value)
        return value

    def create(self, validated_data):
        file = validated_data.get("file")
        if file:
            validated_data["original_name"] = file.name
            validated_data["mime_type"] = getattr(file, "content_type", "") or ""
            validated_data["size_bytes"] = file.size
        return super().create(validated_data)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["file"] = build_media_url(instance.file, self.context.get("request"))
        return rep


class VideoFileSerializer(serializers.ModelSerializer):
    """Serializer para VideoFile."""

    original_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = VideoFile
        fields = [
            "id",
            "file",
            "original_name",
            "mime_type",
            "size_bytes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "mime_type",
            "size_bytes",
            "created_at",
            "updated_at",
        ]

    def validate_file(self, value):
        utils.validate_max_file_size(value)
        utils.validate_video_extension(value)
        return value

    def create(self, validated_data):
        file = validated_data.get("file")
        if file:
            validated_data["original_name"] = file.name
            validated_data["mime_type"] = getattr(file, "content_type", "") or ""
            validated_data["size_bytes"] = file.size
        return super().create(validated_data)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["file"] = build_media_url(instance.file, self.context.get("request"))
        return rep
