from __future__ import annotations

from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from solo.models import SingletonModel

from media_files.models import ImageFile, VideoFile
from static_pages.models import StaticPage
from core.models import Category


class SiteSettings(SingletonModel):
    # Branding
    site_name = models.CharField(
        max_length=150, verbose_name=_("Nom del site"), blank=True, default=""
    )
    tagline = models.CharField(
        max_length=255, verbose_name=_("Claim/Tagline"), blank=True, default=""
    )
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
    phone = models.CharField(
        max_length=50, verbose_name=_("Telèfon"), blank=True, default=""
    )
    support_email = models.EmailField(
        verbose_name=_("Email de suport"), blank=True, default=""
    )
    contact_email = models.EmailField(
        verbose_name=_("Email de contacte"), blank=True, default=""
    )
    address = models.CharField(
        max_length=255, verbose_name=_("Adreça"), blank=True, default=""
    )
    schedule = models.CharField(
        max_length=255, verbose_name=_("Horari"), blank=True, default=""
    )

    # Social (urls simples)
    facebook_url = models.URLField(verbose_name=_("Facebook"), blank=True, default="")
    instagram_url = models.URLField(verbose_name=_("Instagram"), blank=True, default="")
    twitter_url = models.URLField(verbose_name=_("Twitter/X"), blank=True, default="")
    youtube_url = models.URLField(verbose_name=_("YouTube"), blank=True, default="")

    # Integracions públiques
    maps_base_url = models.URLField(
        verbose_name=_("Maps base URL"), blank=True, default=""
    )
    latitude = models.DecimalField(
        max_length=50,
        verbose_name=_("Latitud"),
        blank=True,
        null=True,
        max_digits=9,
        decimal_places=6,
        help_text=_("Latitud del centre del poble"),
    )
    longitude = models.DecimalField(
        max_length=50,
        verbose_name=_("Longitud"),
        blank=True,
        null=True,
        max_digits=9,
        decimal_places=6,
        help_text=_("Longitud del centre del poble"),
    )
    analytics_id = models.CharField(
        max_length=100, verbose_name=_("Analytics ID"), blank=True, default=""
    )

    captcha_site_key = models.CharField(
        max_length=200, verbose_name=_("Captcha site key"), blank=True, default=""
    )

    google_weather_api_key = models.CharField(
        max_length=200,
        verbose_name=_("Google Weather API Key"),
        blank=True,
        default="",
        help_text=_("API Key per a la integració amb Google Cloud Weather API."),
    )

    # Header/Footer (beta)
    show_language_switcher = models.BooleanField(
        default=True, verbose_name=_("Mostrar selector d'idioma (BETA)")
    )
    show_social_footer = models.BooleanField(
        default=True, verbose_name=_("Mostrar xarxes al footer (BETA)")
    )
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
    default_metatitle = models.CharField(
        max_length=255, verbose_name=_("Metatítol per defecte"), blank=True, default=""
    )
    default_metadescription = models.TextField(
        verbose_name=_("Metadescripció per defecte"), blank=True, default=""
    )
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
    youtube_url = models.URLField(
        verbose_name=_("Vídeo YouTube"), blank=True, default=""
    )
    video_title = models.CharField(
        max_length=255, verbose_name=_("Títol del vídeo"), blank=True, default=""
    )
    video_description_internal = models.TextField(
        verbose_name=_("Descripció interna del vídeo"), blank=True, default=""
    )

    # Personalització visual
    theme_config = models.JSONField(
        verbose_name=_("Configuració de tema (esborrany)"),
        blank=True,
        default=dict,
        help_text=_("Configuració visual activa en format JSON."),
    )
    theme_config_published = models.JSONField(
        verbose_name=_("Configuració de tema (publicat)"),
        blank=True,
        default=dict,
        help_text=_("Configuració visual publicada en format JSON."),
    )

    # Avisos globales / Mantenimiento
    alert_enabled = models.BooleanField(
        default=False,
        verbose_name=_("Activar avís global"),
        help_text=_("Mostra una barra d'avís a tota la web para comunicats urgents."),
    )
    alert_message = models.TextField(
        verbose_name=_("Missatge de l'avís"),
        blank=True,
        default="",
        help_text=_("Text que es mostrarà a la barra d'avís."),
    )
    alert_type = models.CharField(
        max_length=20,
        choices=[
            ("info", _("Informació (Blau)")),
            ("success", _("Èxit (Verd)")),
            ("warning", _("Advertència (Taronja)")),
            ("danger", _("Urgent/Perill (Vermell)")),
        ],
        default="info",
        verbose_name=_("Tipus d'avís"),
    )
    alert_link = models.URLField(
        verbose_name=_("Enllaç de l'avís"),
        blank=True,
        default="",
        help_text=_("URL opcional para 'Saber més'."),
    )
    alert_start_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Data d'inici de l'avís"),
        help_text=_("L'avís no es mostrarà abans d'aquesta data (opcional)."),
    )
    alert_end_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Data de fi de l'avís"),
        help_text=_(
            "L'avís s'ocultarà automàticament després d'aquesta data (opcional)."
        ),
    )

    class Meta:
        verbose_name = _("Site Settings")
        verbose_name_plural = _("Site Settings")

    def __str__(self):
        return self.site_name or "Site Settings"

    @property
    def is_alert_active(self) -> bool:
        """Determina si l'avís global ha de ser visible actualment."""
        if not self.alert_enabled or not self.alert_message:
            return False

        from django.utils import timezone
        import logging

        logger = logging.getLogger(__name__)

        now = timezone.now()

        # Log precision for debugging dates
        logger.info(
            f"Checking alert: now={now}, start={self.alert_start_at}, end={self.alert_end_at}"
        )

        if self.alert_start_at and now < self.alert_start_at:
            return False
        if self.alert_end_at and now > self.alert_end_at:
            return False

        return True

    def save(self, *args, **kwargs):
        # Trigger weather update if API Key is changed
        is_new = self.pk is None
        old_key = None
        if not is_new:
            try:
                old_key = SiteSettings.objects.get(pk=self.pk).google_weather_api_key
            except SiteSettings.DoesNotExist:
                pass

        super().save(*args, **kwargs)

        if self.google_weather_api_key and self.google_weather_api_key != old_key:
            from .services import WeatherService

            try:
                WeatherService.update_forecast()
            except Exception:
                pass

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
    type = models.CharField(
        max_length=20, choices=TypeChoices.choices, verbose_name=_("Tipo")
    )

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
    label = models.CharField(
        max_length=200, blank=True, default="", verbose_name=_("Etiqueta")
    )

    class Meta:
        verbose_name = _("Menu Item")
        verbose_name_plural = _("Menu Items")
        ordering = ("location", "parent_id", "order", "id")

    def __str__(self):
        if self.type == self.TypeChoices.CATEGORY and self.category_id:
            return (
                self.category.safe_translation_getter("nombre", any_language=True)
                or self.category.slug
            )
        if self.type == self.TypeChoices.STATIC_PAGE and self.static_page_id:
            return (
                self.static_page.safe_translation_getter("titulo", any_language=True)
                or self.static_page.slug
            )
        return self.label or self.url or f"MenuItem #{self.pk}"

    def clean(self):
        super().clean()

        # Validate type-target consistency
        if self.type == self.TypeChoices.CATEGORY:
            if not self.category_id:
                raise ValidationError({"category": _("Requerida para tipo categoría.")})
            if self.static_page_id or self.url:
                raise ValidationError(
                    {"type": _("Solo puede apuntar a una categoría.")}
                )
        elif self.type == self.TypeChoices.STATIC_PAGE:
            if not self.static_page_id:
                raise ValidationError(
                    {"static_page": _("Requerida para tipo página estática.")}
                )
            if self.category_id or self.url:
                raise ValidationError(
                    {"type": _("Solo puede apuntar a una página estática.")}
                )
        elif self.type == self.TypeChoices.CUSTOM:
            if not self.url:
                raise ValidationError({"url": _("Requerida para link personalizado.")})
            if not self.label:
                raise ValidationError(
                    {"label": _("Etiqueta requerida para link personalizado.")}
                )
            if self.category_id or self.static_page_id:
                raise ValidationError(
                    {"type": _("Solo puede apuntar a una URL personalizada.")}
                )

        # Validate parent: same location/settings, no cycles, max 3 levels
        parent = self.parent
        seen: set[int] = set()
        depth = 0
        while parent:
            if parent.location != self.location:
                raise ValidationError(
                    {"parent": _("El padre debe estar en la misma ubicación.")}
                )
            if parent.settings_id != self.settings_id:
                raise ValidationError(
                    {"parent": _("El padre debe pertenecer al mismo site.")}
                )
            if parent == self or (self.pk and parent.pk == self.pk):
                raise ValidationError(
                    {"parent": _("Un ítem no puede ser su propio padre.")}
                )
            if parent.pk and parent.pk in seen:
                raise ValidationError(
                    {"parent": _("No se pueden crear ciclos en el menú.")}
                )
            if parent.pk:
                seen.add(parent.pk)
            depth += 1
            if depth >= 3:
                raise ValidationError(
                    {"parent": _("Máximo 3 niveles (raíz > hijo > nieto).")}
                )
            parent = parent.parent


class FooterSettings(models.Model):
    site_settings = models.OneToOneField(
        SiteSettings,
        on_delete=models.CASCADE,
        related_name="footer_settings",
        verbose_name=_("ConfiguraciÃ³n del site"),
    )
    eyebrow = models.CharField(
        max_length=120, blank=True, default="", verbose_name=_("Eyebrow")
    )
    title = models.CharField(
        max_length=255, blank=True, default="", verbose_name=_("TÃ­tulo")
    )
    description = models.TextField(
        blank=True, default="", verbose_name=_("DescripciÃ³n")
    )
    show_social_links = models.BooleanField(
        default=True, verbose_name=_("Mostrar enlaces sociales")
    )
    show_contact_block = models.BooleanField(
        default=True, verbose_name=_("Mostrar bloque de contacto")
    )
    show_badges_block = models.BooleanField(
        default=True, verbose_name=_("Mostrar bloque de sellos")
    )
    copyright_text = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name=_("Texto de copyright"),
    )

    class Meta:
        verbose_name = _("Footer Settings")
        verbose_name_plural = _("Footer Settings")

    def __str__(self):
        return self.title or "Footer Settings"

    @classmethod
    def for_site_settings(cls, site_settings: SiteSettings | None = None):
        site_settings = site_settings or SiteSettings.get_solo()
        obj, _ = cls.objects.get_or_create(site_settings=site_settings)
        return obj


class FooterLink(models.Model):
    class SectionChoices(models.TextChoices):
        EXPLORE = "explore", _("Explorar")
        INSTITUTIONAL = "institutional", _("Institucional")

    footer_settings = models.ForeignKey(
        FooterSettings,
        on_delete=models.CASCADE,
        related_name="links",
        verbose_name=_("ConfiguraciÃ³n del footer"),
    )
    section = models.CharField(
        max_length=30,
        choices=SectionChoices.choices,
        default=SectionChoices.EXPLORE,
        verbose_name=_("SecciÃ³n"),
    )
    order = models.PositiveIntegerField(default=0, verbose_name=_("Orden"))
    is_active = models.BooleanField(default=True, verbose_name=_("Activo"))
    type = models.CharField(
        max_length=20, choices=MenuItem.TypeChoices.choices, verbose_name=_("Tipo")
    )
    label = models.CharField(
        max_length=200, blank=True, default="", verbose_name=_("Etiqueta")
    )
    url = models.CharField(
        max_length=500, blank=True, default="", verbose_name=_("URL personalizada")
    )
    category = models.ForeignKey(
        Category,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="footer_links",
        verbose_name=_("CategorÃ­a"),
    )
    static_page = models.ForeignKey(
        StaticPage,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="footer_links",
        verbose_name=_("PÃ¡gina estÃ¡tica"),
    )

    class Meta:
        verbose_name = _("Footer Link")
        verbose_name_plural = _("Footer Links")
        ordering = ("section", "order", "id")

    def __str__(self):
        if self.type == MenuItem.TypeChoices.CATEGORY and self.category_id:
            return (
                self.category.safe_translation_getter("nombre", any_language=True)
                or self.category.slug
            )
        if self.type == MenuItem.TypeChoices.STATIC_PAGE and self.static_page_id:
            return (
                self.static_page.safe_translation_getter("titulo", any_language=True)
                or self.static_page.slug
            )
        return self.label or self.url or f"FooterLink #{self.pk}"

    def clean(self):
        super().clean()

        if self.type == MenuItem.TypeChoices.CATEGORY:
            if not self.category_id:
                raise ValidationError({"category": _("Requerida para tipo categorÃ­a.")})
            if self.static_page_id or self.url:
                raise ValidationError(
                    {"type": _("Solo puede apuntar a una categorÃ­a.")}
                )
        elif self.type == MenuItem.TypeChoices.STATIC_PAGE:
            if not self.static_page_id:
                raise ValidationError(
                    {"static_page": _("Requerida para tipo pÃ¡gina estÃ¡tica.")}
                )
            if self.category_id or self.url:
                raise ValidationError(
                    {"type": _("Solo puede apuntar a una pÃ¡gina estÃ¡tica.")}
                )
        elif self.type == MenuItem.TypeChoices.CUSTOM:
            if not self.url:
                raise ValidationError({"url": _("Requerida para link personalizado.")})
            if not self.label:
                raise ValidationError(
                    {"label": _("Etiqueta requerida para link personalizado.")}
                )
            if self.category_id or self.static_page_id:
                raise ValidationError(
                    {"type": _("Solo puede apuntar a una URL personalizada.")}
                )


class FooterBadge(models.Model):
    footer_settings = models.ForeignKey(
        FooterSettings,
        on_delete=models.CASCADE,
        related_name="badges",
        verbose_name=_("ConfiguraciÃ³n del footer"),
    )
    title = models.CharField(max_length=150, verbose_name=_("TÃ­tulo"))
    alt_text = models.CharField(
        max_length=255, blank=True, default="", verbose_name=_("Texto alternativo")
    )
    url = models.CharField(
        max_length=500, blank=True, default="", verbose_name=_("Enlace")
    )
    image = models.ForeignKey(
        ImageFile,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="footer_badges",
        verbose_name=_("Imagen"),
    )
    order = models.PositiveIntegerField(default=0, verbose_name=_("Orden"))
    is_active = models.BooleanField(default=False, verbose_name=_("Activo"))

    class Meta:
        verbose_name = _("Footer Badge")
        verbose_name_plural = _("Footer Badges")
        ordering = ("order", "id")

    def __str__(self):
        return self.title


class BuildJob(models.Model):
    """Treball de compilació i publicació del tema."""

    class StatusChoices(models.TextChoices):
        PENDING = "pending", _("Pendent")
        RUNNING = "running", _("En progrés")
        SUCCESS = "success", _("Completat")
        FAILED = "failed", _("Fallit")

    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
        verbose_name=_("Estat"),
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Creat el"))
    started_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Iniciat el"))
    finished_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Finalitzat el"))
    error_message = models.TextField(blank=True, default="", verbose_name=_("Missatge d'error"))
    theme_config = models.JSONField(default=dict, verbose_name=_("Configuració de tema"))

    class Meta:
        verbose_name = _("Build Job")
        verbose_name_plural = _("Build Jobs")
        ordering = ("-created_at",)

    def __str__(self):
        return f"BuildJob #{self.pk} - {self.get_status_display()}"
