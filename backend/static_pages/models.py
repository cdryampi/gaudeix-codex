from __future__ import annotations

from django.db import models
from django.utils.translation import gettext_lazy as _
from parler.models import TranslatableModel, TranslatedFields

from core.models import ContentBase
from media_files.models import DocumentFile, ImageFile


class StaticPage(TranslatableModel, ContentBase):
    class TemplateChoices(models.TextChoices):
        INFO_POINT = "info_point", _("Punt d'informació")
        PRIVACY = "privacy", _("Política de privacitat")
        LEGAL = "legal_notice", _("Avís legal")
        COOKIES = "cookies", _("Política de cookies")
        CONTACT = "contact", _("Contacte")
        INCLUSION = "inclusion", _("Diversitat i inclusió")

    template = models.CharField(
        max_length=50,
        choices=TemplateChoices.choices,
        unique=True,
        verbose_name=_("Template"),
        help_text=_("Tipus de plantilla predefinida (única per pàgina)"),
    )
    translations = TranslatedFields(
        titulo=models.CharField(max_length=200, verbose_name=_("Títol")),
        cuerpo=models.TextField(blank=True, verbose_name=_("Cos")),
    )
    is_published = models.BooleanField(default=True, verbose_name=_("Publicado"))
    featured_media = models.ForeignKey(
        ImageFile,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="static_pages_featured",
        verbose_name=_("Imagen destacada"),
    )
    attachment = models.ForeignKey(
        DocumentFile,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="static_pages_attachment",
        verbose_name=_("Documento adjunto"),
    )

    class Meta:
        verbose_name = _("Static Page")
        verbose_name_plural = _("Static Pages")
        ordering = ("slug",)

    def __str__(self):
        title = self.safe_translation_getter("titulo", any_language=True)
        return title or self.slug
