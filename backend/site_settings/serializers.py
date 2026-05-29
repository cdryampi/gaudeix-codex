from __future__ import annotations

from django.core.validators import URLValidator
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from core.serializers import CategorySerializer
from media_files.serializers import ImageFileSerializer, VideoFileSerializer
from static_pages.serializers import StaticPageSerializer

from .models import BuildJob, FooterBadge, FooterLink, FooterSettings, MenuItem, SiteSettings


def is_allowed_link_value(value: str) -> bool:
    if not value:
        return False

    if value.startswith(("/", "#", "mailto:", "tel:")):
        return True

    validator = URLValidator()
    try:
        validator(value)
    except Exception:
        return False
    return True


class FooterStaticPageLinkSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    slug = serializers.CharField(read_only=True)
    template = serializers.CharField(read_only=True)
    titulo = serializers.CharField(read_only=True)


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

    current_weather = serializers.SerializerMethodField()

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
            "google_weather_api_key",
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
            "current_weather",
            "theme_config",
            "theme_config_published",
        ]
        read_only_fields = ["id", "current_weather", "theme_config_published"]

    def validate_theme_config(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError(_("La configuració de tema ha de ser un objecte JSON."))

        allowed_keys = {
            "primary",
            "secondary",
            "accent",
            "background_light",
            "background_dark",
            "surface",
            "surface_muted",
            "text_primary",
            "text_secondary",
            "radius_scale",
            "shadow_preset",
            "theme_preset",
        }

        import re
        hex_color_regex = re.compile(r"^#[0-9A-Fa-f]{6}$")

        for k, v in value.items():
            if k not in allowed_keys:
                raise serializers.ValidationError(_(f"Clau de tema no permesa: {k}"))

            if k in {
                "primary",
                "secondary",
                "accent",
                "background_light",
                "background_dark",
                "surface",
                "surface_muted",
                "text_primary",
                "text_secondary",
            }:
                if v and not hex_color_regex.match(str(v)):
                    raise serializers.ValidationError(
                        _(f"El color per a {k} ha de ser un format HEX de 6 caràcters vàlid (ex: #ffffff).")
                    )

            if k == "radius_scale" and v is not None:
                try:
                    float(v)
                except ValueError:
                    raise serializers.ValidationError(_("radius_scale ha de ser un número vàlid."))

            if k == "shadow_preset" and v is not None:
                if v not in {"none", "sm", "md", "lg"}:
                    raise serializers.ValidationError(
                        _("shadow_preset ha de ser un dels següents: none, sm, md, lg.")
                    )

            if k == "theme_preset" and v is not None:
                if v not in {"classic", "modern", "vibrant", "oceanic", "sunset"}:
                    raise serializers.ValidationError(_("theme_preset no vàlid."))

        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")

        # Si no hi ha request o el request és d'un usuari no autenticat,
        # retornem la configuració de tema publicada sota el camp theme_config.
        if not request or not request.user or not request.user.is_authenticated:
            data["theme_config"] = (
                data.get("theme_config_published") or data.get("theme_config") or {}
            )

        return data

    def get_current_weather(self, obj):
        from django.utils import timezone

        from .models_weather import MunicipalityWeather

        weather = MunicipalityWeather.objects.order_by("-updated_at").first()
        if not weather:
            return None

        today = timezone.now().strftime("%Y-%m-%d")
        days = weather.forecast_data.get("days", [])

        for day in days:
            if day.get("datetime") == today:
                return {
                    "tempmax": day.get("tempmax"),
                    "tempmin": day.get("tempmin"),
                    "weather_code": day.get("weather_code"),
                    "precip_prob": day.get("precip_prob"),
                    "datetime": day.get("datetime"),
                }
        return None

    def update(self, instance, validated_data):
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
                    {"category_id": "Requerida para tipo categoria."}
                )
            if static_page_id:
                raise serializers.ValidationError(
                    {"static_page_id": "No permitido para tipo categoria."}
                )
            if url:
                raise serializers.ValidationError(
                    {"url": "No permitido para tipo categoria."}
                )
        elif item_type == MenuItem.TypeChoices.STATIC_PAGE:
            if not static_page_id:
                raise serializers.ValidationError(
                    {"static_page_id": "Requerida para tipo pagina estatica."}
                )
            if category_id:
                raise serializers.ValidationError(
                    {"category_id": "No permitido para tipo pagina estatica."}
                )
            if url:
                raise serializers.ValidationError(
                    {"url": "No permitido para tipo pagina estatica."}
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
                    {"type": "No puede apuntar a categoria o pagina."}
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

        target_parent = parent
        seen: set[int] = set()
        depth = 0
        while target_parent:
            if self.instance and target_parent.pk == self.instance.pk:
                raise serializers.ValidationError(
                    {"parent": "Un item no puede ser su propio padre."}
                )
            if target_parent.pk and target_parent.pk in seen:
                raise serializers.ValidationError(
                    {"parent": "No se pueden crear ciclos en el menu."}
                )
            if target_parent.pk:
                seen.add(target_parent.pk)
            if location and target_parent.location != location:
                raise serializers.ValidationError(
                    {"parent": "El padre debe estar en la misma ubicacion."}
                )
            if settings_id and target_parent.settings_id != settings_id:
                raise serializers.ValidationError(
                    {"parent": "El padre debe pertenecer al mismo site."}
                )
            depth += 1
            if depth >= 3:
                raise serializers.ValidationError(
                    {"parent": "Maximo 3 niveles (raiz > hijo > nieto)."}
                )
            target_parent = target_parent.parent

        return attrs


class FooterSettingsSerializer(serializers.ModelSerializer):
    site_settings_id = serializers.IntegerField(source="site_settings.id", read_only=True)

    class Meta:
        model = FooterSettings
        fields = [
            "id",
            "site_settings_id",
            "eyebrow",
            "title",
            "description",
            "show_social_links",
            "show_contact_block",
            "show_badges_block",
            "copyright_text",
        ]
        read_only_fields = ["id", "site_settings_id"]


class FooterLinkSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    static_page = StaticPageSerializer(read_only=True)
    static_page_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    footer_settings_id = serializers.IntegerField(
        source="footer_settings.id", read_only=True
    )

    class Meta:
        model = FooterLink
        fields = [
            "id",
            "footer_settings_id",
            "section",
            "order",
            "is_active",
            "type",
            "label",
            "url",
            "category",
            "category_id",
            "static_page",
            "static_page_id",
        ]
        read_only_fields = [
            "id",
            "footer_settings_id",
            "category",
            "static_page",
        ]

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
                    {"category_id": "Requerida para tipo categoria."}
                )
            if static_page_id:
                raise serializers.ValidationError(
                    {"static_page_id": "No permitido para tipo categoria."}
                )
            if url:
                raise serializers.ValidationError(
                    {"url": "No permitido para tipo categoria."}
                )
        elif item_type == MenuItem.TypeChoices.STATIC_PAGE:
            if not static_page_id:
                raise serializers.ValidationError(
                    {"static_page_id": "Requerida para tipo pagina estatica."}
                )
            if category_id:
                raise serializers.ValidationError(
                    {"category_id": "No permitido para tipo pagina estatica."}
                )
            if url:
                raise serializers.ValidationError(
                    {"url": "No permitido para tipo pagina estatica."}
                )
        elif item_type == MenuItem.TypeChoices.CUSTOM:
            if not url:
                raise serializers.ValidationError(
                    {"url": "Requerida para link personalizado."}
                )
            if not is_allowed_link_value(url):
                raise serializers.ValidationError(
                    {"url": "Introduce una URL absoluta o una ruta relativa valida."}
                )
            if not label:
                raise serializers.ValidationError(
                    {"label": "Etiqueta requerida para link personalizado."}
                )
            if category_id or static_page_id:
                raise serializers.ValidationError(
                    {"type": "No puede apuntar a categoria o pagina."}
                )

        return attrs


class FooterBadgeSerializer(serializers.ModelSerializer):
    image = ImageFileSerializer(read_only=True)
    image_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    footer_settings_id = serializers.IntegerField(
        source="footer_settings.id", read_only=True
    )

    class Meta:
        model = FooterBadge
        fields = [
            "id",
            "footer_settings_id",
            "title",
            "alt_text",
            "url",
            "image",
            "image_id",
            "order",
            "is_active",
        ]
        read_only_fields = ["id", "footer_settings_id", "image"]

    def validate(self, attrs):
        url = attrs.get("url") if "url" in attrs else getattr(self.instance, "url", "")
        if url and not is_allowed_link_value(url):
            raise serializers.ValidationError(
                {"url": "Introduce una URL absoluta o una ruta relativa valida."}
            )
        return attrs

    def update(self, instance, validated_data):
        if "image_id" in validated_data:
            instance.image_id = validated_data.pop("image_id")
        return super().update(instance, validated_data)

    def create(self, validated_data):
        image_id = validated_data.pop("image_id", None)
        instance = super().create(validated_data)
        if image_id is not None:
            instance.image_id = image_id
            instance.save(update_fields=["image"])
        return instance


class FooterPublicLinkSerializer(FooterLinkSerializer):
    class Meta(FooterLinkSerializer.Meta):
        fields = [
            "id",
            "section",
            "order",
            "type",
            "label",
            "url",
            "category",
            "static_page",
        ]
        read_only_fields = fields


class FooterPublicBadgeSerializer(FooterBadgeSerializer):
    class Meta(FooterBadgeSerializer.Meta):
        fields = [
            "id",
            "title",
            "alt_text",
            "url",
            "image",
            "order",
        ]
        read_only_fields = fields


class FooterPublicSerializer(serializers.ModelSerializer):
    branding = serializers.SerializerMethodField()
    contact = serializers.SerializerMethodField()
    social = serializers.SerializerMethodField()
    legal = serializers.SerializerMethodField()
    links = serializers.SerializerMethodField()
    badges = serializers.SerializerMethodField()

    class Meta:
        model = FooterSettings
        fields = [
            "id",
            "eyebrow",
            "title",
            "description",
            "show_social_links",
            "show_contact_block",
            "show_badges_block",
            "copyright_text",
            "branding",
            "contact",
            "social",
            "legal",
            "links",
            "badges",
        ]
        read_only_fields = fields

    def get_branding(self, obj):
        site = obj.site_settings
        return {
            "site_name": site.site_name,
            "tagline": site.tagline,
            "logo": ImageFileSerializer(site.logo, context=self.context).data
            if site.logo
            else None,
            "logo_dark": ImageFileSerializer(site.logo_dark, context=self.context).data
            if site.logo_dark
            else None,
            "favicon": ImageFileSerializer(site.favicon, context=self.context).data
            if site.favicon
            else None,
        }

    def get_contact(self, obj):
        site = obj.site_settings
        return {
            "phone": site.phone,
            "support_email": site.support_email,
            "contact_email": site.contact_email,
            "address": site.address,
            "schedule": site.schedule,
            "maps_base_url": site.maps_base_url,
            "latitude": site.latitude,
            "longitude": site.longitude,
        }

    def get_social(self, obj):
        site = obj.site_settings
        return {
            "facebook_url": site.facebook_url,
            "instagram_url": site.instagram_url,
            "twitter_url": site.twitter_url,
            "youtube_url": site.youtube_url,
        }

    def get_legal(self, obj):
        site = obj.site_settings

        def serialize(page):
            return (
                FooterStaticPageLinkSerializer(page, context=self.context).data
                if page
                else None
            )

        return {
            "privacy_page": serialize(site.privacy_page),
            "cookies_page": serialize(site.cookies_page),
            "legal_page": serialize(site.legal_page),
            "inclusion_page": serialize(site.inclusion_page),
        }

    def get_links(self, obj):
        grouped = {
            FooterLink.SectionChoices.EXPLORE: [],
            FooterLink.SectionChoices.INSTITUTIONAL: [],
        }
        for link in obj.links.filter(is_active=True).order_by("section", "order", "id"):
            grouped.setdefault(link.section, []).append(
                FooterPublicLinkSerializer(link, context=self.context).data
            )
        return grouped

    def get_badges(self, obj):
        badges = obj.badges.filter(is_active=True).order_by("order", "id")
        return FooterPublicBadgeSerializer(badges, many=True, context=self.context).data


class BuildJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildJob
        fields = [
            "id",
            "status",
            "created_at",
            "started_at",
            "finished_at",
            "error_message",
            "theme_config",
        ]
        read_only_fields = [
            "id",
            "status",
            "created_at",
            "started_at",
            "finished_at",
            "error_message",
            "theme_config",
        ]
