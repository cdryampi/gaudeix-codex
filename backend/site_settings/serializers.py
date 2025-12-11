from __future__ import annotations

from rest_framework import serializers

from .models import SiteSettings
from media_files.serializers import ImageFileSerializer
from static_pages.serializers import StaticPageSerializer


class SiteSettingsSerializer(serializers.ModelSerializer):
    logo = ImageFileSerializer(read_only=True)
    logo_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    logo_dark = ImageFileSerializer(read_only=True)
    logo_dark_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    favicon = ImageFileSerializer(read_only=True)
    favicon_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    default_og_image = ImageFileSerializer(read_only=True)
    default_og_image_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    privacy_page = StaticPageSerializer(read_only=True)
    privacy_page_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    cookies_page = StaticPageSerializer(read_only=True)
    cookies_page_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    legal_page = StaticPageSerializer(read_only=True)
    legal_page_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    inclusion_page = StaticPageSerializer(read_only=True)
    inclusion_page_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

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
        ]
        read_only_fields = ["id"]

    def update(self, instance, validated_data):
        # Map write-only ids to FK fields
        fk_fields = [
            ("logo_id", "logo_id"),
            ("logo_dark_id", "logo_dark_id"),
            ("favicon_id", "favicon_id"),
            ("default_og_image_id", "default_og_image_id"),
            ("privacy_page_id", "privacy_page_id"),
            ("cookies_page_id", "cookies_page_id"),
            ("legal_page_id", "legal_page_id"),
            ("inclusion_page_id", "inclusion_page_id"),
        ]
        for write_field, model_field in fk_fields:
            if write_field in validated_data:
                setattr(instance, model_field, validated_data.pop(write_field))

        return super().update(instance, validated_data)
