from __future__ import annotations

from rest_framework import serializers

from .models import MenuItem, SiteSettings
from core.serializers import CategorySerializer
from media_files.serializers import ImageFileSerializer, VideoFileSerializer
from static_pages.serializers import StaticPageSerializer


class SiteSettingsSerializer(serializers.ModelSerializer):
    logo = ImageFileSerializer(read_only=True)
    logo_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    logo_dark = ImageFileSerializer(read_only=True)
    logo_dark_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    favicon = ImageFileSerializer(read_only=True)
    favicon_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    default_og_image = ImageFileSerializer(read_only=True)
    default_og_image_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )

    background_video = VideoFileSerializer(read_only=True)
    background_video_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )

    privacy_page = StaticPageSerializer(read_only=True)
    privacy_page_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    cookies_page = StaticPageSerializer(read_only=True)
    cookies_page_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    legal_page = StaticPageSerializer(read_only=True)
    legal_page_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    inclusion_page = StaticPageSerializer(read_only=True)
    inclusion_page_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = SiteSettings
        fields = [
            "id",
            "site_name",
            "tagline",
            "logo",
            "logo_id",
            "logo_dark",
            "logo_dark_id",
            "favicon",
            "favicon_id",
            "phone",
            "support_email",
            "contact_email",
            "address",
            "schedule",
            "facebook_url",
            "instagram_url",
            "twitter_url",
            "youtube_url",
            "maps_base_url",
            "latitude",
            "longitude",
            "analytics_id",
            "captcha_site_key",
            "show_language_switcher",
            "show_social_footer",
            "privacy_page",
            "privacy_page_id",
            "cookies_page",
            "cookies_page_id",
            "legal_page",
            "legal_page_id",
            "inclusion_page",
            "inclusion_page_id",
            "default_metatitle",
            "default_metadescription",
            "default_og_image",
            "default_og_image_id",
            "video_enabled",
            "background_video",
            "background_video_id",
            "video_title",
            "video_description_internal",
            "alert_enabled",
            "alert_message",
            "alert_type",
            "alert_link",
            "alert_start_at",
            "alert_end_at",
            "is_alert_active",
        ]

        read_only_fields = ["id"]

    def update(self, instance, validated_data):
        # Map write-only ids to FK fields
        fk_fields = [
            ("logo_id", "logo_id"),
            ("logo_dark_id", "logo_dark_id"),
            ("favicon_id", "favicon_id"),
            ("default_og_image_id", "default_og_image_id"),
            ("background_video_id", "background_video_id"),
            ("privacy_page_id", "privacy_page_id"),
            ("cookies_page_id", "cookies_page_id"),
            ("legal_page_id", "legal_page_id"),
            ("inclusion_page_id", "inclusion_page_id"),
        ]
        for write_field, model_field in fk_fields:
            if write_field in validated_data:
                setattr(instance, model_field, validated_data.pop(write_field))

        return super().update(instance, validated_data)


class MenuItemSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    static_page = StaticPageSerializer(read_only=True)
    static_page_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    parent = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "location",
            "parent",
            "order",
            "type",
            "label",
            "url",
            "category",
            "category_id",
            "static_page",
            "static_page_id",
        ]
        read_only_fields = ["id", "category", "static_page"]

    def validate(self, attrs):
        item_type = attrs.get("type") or getattr(self.instance, "type", None)
        category_id = (
            attrs.get("category_id")
            if "category_id" in attrs
            else getattr(self.instance, "category_id", None)
        )
        static_page_id = (
            attrs.get("static_page_id")
            if "static_page_id" in attrs
            else getattr(self.instance, "static_page_id", None)
        )
        url = attrs.get("url") if "url" in attrs else getattr(self.instance, "url", "")
        label = (
            attrs.get("label")
            if "label" in attrs
            else getattr(self.instance, "label", "")
        )

        if item_type == MenuItem.TypeChoices.CATEGORY:
            if not category_id:
                raise serializers.ValidationError(
                    {"category_id": "Requerida para tipo categoría."}
                )
            if static_page_id:
                raise serializers.ValidationError(
                    {"static_page_id": "No permitido para tipo categoría."}
                )
            if url:
                raise serializers.ValidationError(
                    {"url": "No permitido para tipo categoría."}
                )
        elif item_type == MenuItem.TypeChoices.STATIC_PAGE:
            if not static_page_id:
                raise serializers.ValidationError(
                    {"static_page_id": "Requerida para tipo página estática."}
                )
            if category_id:
                raise serializers.ValidationError(
                    {"category_id": "No permitido para tipo página estática."}
                )
            if url:
                raise serializers.ValidationError(
                    {"url": "No permitido para tipo página estática."}
                )
        elif item_type == MenuItem.TypeChoices.CUSTOM:
            if not url:
                raise serializers.ValidationError(
                    {"url": "Requerida para link personalizado."}
                )
            if not label:
                raise serializers.ValidationError(
                    {"label": "Etiqueta requerida para link personalizado."}
                )
            if category_id or static_page_id:
                raise serializers.ValidationError(
                    {"type": "No puede apuntar a categoría o página."}
                )

        parent = (
            attrs.get("parent")
            if "parent" in attrs
            else getattr(self.instance, "parent", None)
        )
        location = (
            attrs.get("location")
            if "location" in attrs
            else getattr(self.instance, "location", None)
        )
        settings_id = getattr(self.instance, "settings_id", None)

        # Depth / cycles (max 3 levels)
        target_parent = parent
        seen: set[int] = set()
        depth = 0
        while target_parent:
            if self.instance and target_parent.pk == self.instance.pk:
                raise serializers.ValidationError(
                    {"parent": "Un ítem no puede ser su propio padre."}
                )
            if target_parent.pk and target_parent.pk in seen:
                raise serializers.ValidationError(
                    {"parent": "No se pueden crear ciclos en el menú."}
                )
            if target_parent.pk:
                seen.add(target_parent.pk)
            if location and target_parent.location != location:
                raise serializers.ValidationError(
                    {"parent": "El padre debe estar en la misma ubicación."}
                )
            if settings_id and target_parent.settings_id != settings_id:
                raise serializers.ValidationError(
                    {"parent": "El padre debe pertenecer al mismo site."}
                )
            depth += 1
            if depth >= 3:
                raise serializers.ValidationError(
                    {"parent": "Máximo 3 niveles (raíz > hijo > nieto)."}
                )
            target_parent = target_parent.parent

        return attrs
