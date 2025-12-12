from __future__ import annotations

from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from solo.models import SingletonModel

from media_files.models import ImageFile, DocumentFile, VideoFile
from static_pages.models import StaticPage
from core.models import Category


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

    # Vídeo hero / background
    video_enabled = models.BooleanField(
        default=True,
        verbose_name=_("Activar vÇðdeo del hero"),
        help_text=_("Activa o desactiva el vÇðdeo de fons de la home."),
    )
    background_video = models.ForeignKey(
        VideoFile,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="site_background_video",
        verbose_name=_("Vídeo de fons"),
    )
    youtube_url = models.URLField(verbose_name=_("Vídeo YouTube"), blank=True, default="")
    video_title = models.CharField(max_length=255, verbose_name=_("Títol del vídeo"), blank=True, default="")
    video_description_internal = models.TextField(
        verbose_name=_("Descripció interna del vídeo"), blank=True, default=""
    )

    class Meta:
        verbose_name = _("Site Settings")
        verbose_name_plural = _("Site Settings")

    def __str__(self):
        return self.site_name or "Site Settings"


class MenuItem(models.Model):
    """Elemento de menú configurable para header/footer."""

    class LocationChoices(models.TextChoices):
        HEADER = "header", _("Header")
        FOOTER = "footer", _("Footer")

    class TypeChoices(models.TextChoices):
        CATEGORY = "category", _("Categoría")
        STATIC_PAGE = "static_page", _("Página estática")
        CUSTOM = "custom", _("Link personalizado")

    settings = models.ForeignKey(
        SiteSettings,
        on_delete=models.CASCADE,
        related_name="menu_items",
        verbose_name=_("Configuración del site"),
    )
    location = models.CharField(
        max_length=20,
        choices=LocationChoices.choices,
        default=LocationChoices.HEADER,
        verbose_name=_("Ubicación"),
    )
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="children",
        verbose_name=_("Padre"),
    )
    order = models.PositiveIntegerField(default=0, verbose_name=_("Orden"))
    type = models.CharField(max_length=20, choices=TypeChoices.choices, verbose_name=_("Tipo"))

    category = models.ForeignKey(
        Category,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="menu_items",
        verbose_name=_("Categoría"),
    )
    static_page = models.ForeignKey(
        StaticPage,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="menu_items",
        verbose_name=_("Página estática"),
    )
    url = models.URLField(blank=True, default="", verbose_name=_("URL personalizada"))
    label = models.CharField(max_length=200, blank=True, default="", verbose_name=_("Etiqueta"))

    class Meta:
        verbose_name = _("Menu Item")
        verbose_name_plural = _("Menu Items")
        ordering = ("location", "parent_id", "order", "id")

    def __str__(self):
        if self.type == self.TypeChoices.CATEGORY and self.category_id:
            return self.category.safe_translation_getter("nombre", any_language=True) or self.category.slug
        if self.type == self.TypeChoices.STATIC_PAGE and self.static_page_id:
            return self.static_page.safe_translation_getter("titulo", any_language=True) or self.static_page.slug
        return self.label or self.url or f"MenuItem #{self.pk}"

    def clean(self):
        super().clean()

        # Validate type-target consistency
        if self.type == self.TypeChoices.CATEGORY:
            if not self.category_id:
                raise ValidationError({"category": _("Requerida para tipo categoría.")})
            if self.static_page_id or self.url:
                raise ValidationError({"type": _("Solo puede apuntar a una categoría.")})
        elif self.type == self.TypeChoices.STATIC_PAGE:
            if not self.static_page_id:
                raise ValidationError({"static_page": _("Requerida para tipo página estática.")})
            if self.category_id or self.url:
                raise ValidationError({"type": _("Solo puede apuntar a una página estática.")})
        elif self.type == self.TypeChoices.CUSTOM:
            if not self.url:
                raise ValidationError({"url": _("Requerida para link personalizado.")})
            if not self.label:
                raise ValidationError({"label": _("Etiqueta requerida para link personalizado.")})
            if self.category_id or self.static_page_id:
                raise ValidationError({"type": _("Solo puede apuntar a una URL personalizada.")})

        # Validate parent: same location/settings, no cycles, max 3 levels
        parent = self.parent
        seen: set[int] = set()
        depth = 0
        while parent:
            if parent.location != self.location:
                raise ValidationError({"parent": _("El padre debe estar en la misma ubicación.")})
            if parent.settings_id != self.settings_id:
                raise ValidationError({"parent": _("El padre debe pertenecer al mismo site.")})
            if parent == self or (self.pk and parent.pk == self.pk):
                raise ValidationError({"parent": _("Un ítem no puede ser su propio padre.")})
            if parent.pk and parent.pk in seen:
                raise ValidationError({"parent": _("No se pueden crear ciclos en el menú.")})
            if parent.pk:
                seen.add(parent.pk)
            depth += 1
            if depth >= 3:
                raise ValidationError({"parent": _("Máximo 3 niveles (raíz > hijo > nieto).")})
            parent = parent.parent
