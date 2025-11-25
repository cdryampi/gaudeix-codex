from __future__ import annotations

from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from parler.models import TranslatableModel, TranslatedFields


class Event(TranslatableModel):
    """
    Event model with multilingual support via django-parler.
    """

    translations = TranslatedFields(
        title=models.CharField(_("Title"), max_length=200),
        description=models.TextField(_("Description"), blank=True),
    )

    slug = models.SlugField(_("Slug"), max_length=220, unique=True)
    start_at = models.DateTimeField(_("Start at"))
    end_at = models.DateTimeField(_("End at"), null=True, blank=True)
    is_published = models.BooleanField(_("Is published"), default=True)

    # Placeholder for future place model integration.
    location_text = models.CharField(
        _("Location (text)"),
        max_length=255,
        blank=True,
        help_text=_("Free text location. TODO: replace with Place relation when available."),
    )

    featured_media = models.ForeignKey(
        "media_files.ImageFile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="featured_in_events",
        verbose_name=_("Featured media"),
    )
    attachments = models.ManyToManyField(
        "media_files.DocumentFile",
        blank=True,
        related_name="attached_to_events",
        verbose_name=_("Attachments"),
        help_text=_("Document attachments linked to this event."),
    )

    created_at = models.DateTimeField(_("Created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated at"), auto_now=True)

    class Meta:
        ordering = ("start_at", "id")
        verbose_name = _("Event")
        verbose_name_plural = _("Events")

    def __str__(self) -> str:
        title = self.safe_translation_getter("title", any_language=True) or _("Event")
        return f"{title} @ {self.start_at}"

    def is_future(self) -> bool:
        return self.start_at > timezone.now()

    def clean(self) -> None:
        super().clean()
        if self.end_at and self.end_at < self.start_at:
            raise ValidationError({"end_at": _("End date cannot be before start date.")})

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_unique_slug()
        self.full_clean()
        super().save(*args, **kwargs)

    def _generate_unique_slug(self) -> str:
        """
        Generate a unique slug based on the translated title.
        """
        if self.pk:
            base_title = self.safe_translation_getter("title", any_language=True) or "event"
        else:
            base_title = getattr(self, "title", None) or "event"
        base_slug = slugify(base_title) or "event"
        slug_candidate = base_slug
        counter = 2

        while Event.objects.filter(slug=slug_candidate).exclude(pk=self.pk).exists():
            slug_candidate = f"{base_slug}-{counter}"
            counter += 1

        return slug_candidate
