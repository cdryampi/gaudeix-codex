from django.contrib import admin
from solo.admin import SingletonModelAdmin

from .models import SiteSettings


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
                    "youtube_url",
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
                )
            },
        ),
    )
    raw_id_fields = ("logo", "logo_dark", "favicon", "default_og_image", "privacy_page", "cookies_page", "legal_page", "inclusion_page")
