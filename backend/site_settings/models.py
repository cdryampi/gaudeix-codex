from __future__ import annotations

from django.db import models
from django.utils.translation import gettext_lazy as _
from solo.models import SingletonModel

from media_files.models import ImageFile, DocumentFile
from static_pages.models import StaticPage


class SiteSettings(SingletonModel):
    # Branding
    site_name = models.CharField(max_length=150, verbose_name=_("Nom del site"), blank=True, default="")
    tagline = models.CharField(max_length=255, verbose_name=_("Claim/Tagline"), blank=True, default="")
    logo = models.ForeignKey(
        ImageFile,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="site_logo",
        verbose_name=_("Logo"),
    )
    logo_dark = models.ForeignKey(
        ImageFile,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="site_logo_dark",
        verbose_name=_("Logo (dark)"),
    )
    favicon = models.ForeignKey(
        ImageFile,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="site_favicon",
        verbose_name=_("Favicon"),
    )

    # Contacto
    phone = models.CharField(max_length=50, verbose_name=_("Telèfon"), blank=True, default="")
    support_email = models.EmailField(verbose_name=_("Email de suport"), blank=True, default="")
    contact_email = models.EmailField(verbose_name=_("Email de contacte"), blank=True, default="")
    address = models.CharField(max_length=255, verbose_name=_("Adreça"), blank=True, default="")
    schedule = models.CharField(max_length=255, verbose_name=_("Horari"), blank=True, default="")

    # Social (urls simples)
    facebook_url = models.URLField(verbose_name=_("Facebook"), blank=True, default="")
    instagram_url = models.URLField(verbose_name=_("Instagram"), blank=True, default="")
    twitter_url = models.URLField(verbose_name=_("Twitter/X"), blank=True, default="")
    youtube_url = models.URLField(verbose_name=_("YouTube"), blank=True, default="")

    # Integracions públiques
    maps_base_url = models.URLField(verbose_name=_("Maps base URL"), blank=True, default="")
    analytics_id = models.CharField(max_length=100, verbose_name=_("Analytics ID"), blank=True, default="")
    captcha_site_key = models.CharField(max_length=200, verbose_name=_("Captcha site key"), blank=True, default="")

    # Header/Footer (beta)
    show_language_switcher = models.BooleanField(default=True, verbose_name=_("Mostrar selector d'idioma (BETA)"))
    show_social_footer = models.BooleanField(default=True, verbose_name=_("Mostrar xarxes al footer (BETA)"))
    privacy_page = models.ForeignKey(
        StaticPage,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="privacy_settings",
        verbose_name=_("Pàgina de privacitat"),
    )
    cookies_page = models.ForeignKey(
        StaticPage,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="cookies_settings",
        verbose_name=_("Pàgina de cookies"),
    )
    legal_page = models.ForeignKey(
        StaticPage,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="legal_settings",
        verbose_name=_("Avís legal"),
    )
    inclusion_page = models.ForeignKey(
        StaticPage,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="inclusion_settings",
        verbose_name=_("Diversitat i inclusió"),
    )

    # SEO per defecte
    default_metatitle = models.CharField(max_length=255, verbose_name=_("Metatítol per defecte"), blank=True, default="")
    default_metadescription = models.TextField(verbose_name=_("Metadescripció per defecte"), blank=True, default="")
    default_og_image = models.ForeignKey(
        ImageFile,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="site_default_og",
        verbose_name=_("Imatge OG per defecte"),
    )

    class Meta:
        verbose_name = _("Site Settings")
        verbose_name_plural = _("Site Settings")

    def __str__(self):
        return self.site_name or "Site Settings"
