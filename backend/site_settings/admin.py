from django.contrib import admin
from solo.admin import SingletonModelAdmin

from .models import MenuItem, SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(SingletonModelAdmin):
    fieldsets = (
        ("Identitat", {"fields": ("site_name", "tagline", "logo", "logo_dark", "favicon")}),
        (
            "Contacte",
            {
                "fields": (
                    "phone",
                    "support_email",
                    "contact_email",
                    "address",
                    "schedule",
                )
            },
        ),
        (
            "Social",
            {
                "fields": (
                    "facebook_url",
                    "instagram_url",
                    "twitter_url",
                )
            },
        ),
        (
            "Integracions públiques",
            {
                "fields": (
                    "maps_base_url",
                    "analytics_id",
                    "captcha_site_key",
                )
            },
        ),
        (
            "Header/Footer (BETA)",
            {
                "description": "Camp beta: revisa manualment l'encaix al frontend.",
                "fields": (
                    "show_language_switcher",
                    "show_social_footer",
                    "privacy_page",
                    "cookies_page",
                    "legal_page",
                    "inclusion_page",
                ),
            },
        ),
        (
            "SEO per defecte",
            {
                "fields": (
                    "default_metatitle",
                    "default_metadescription",
                    "default_og_image",
                    "video_enabled",
                    "video_title",
                    "video_description_internal",
                    "background_video",
                    "youtube_url",
                )
            },
        ),
    )
    raw_id_fields = (
        "logo",
        "logo_dark",
        "favicon",
        "default_og_image",
        "background_video",
        "privacy_page",
        "cookies_page",
        "legal_page",
        "inclusion_page",
    )


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ("id", "location", "type", "label", "category", "static_page", "parent", "order")
    list_filter = ("location", "type")
    search_fields = (
        "label",
        "url",
        "category__translations__nombre",
        "static_page__translations__titulo",
    )
    raw_id_fields = ("category", "static_page", "parent")
    ordering = ("location", "parent_id", "order", "id")

    def save_model(self, request, obj, form, change):
        if not obj.settings_id:
            obj.settings = SiteSettings.get_solo()
        super().save_model(request, obj, form, change)
