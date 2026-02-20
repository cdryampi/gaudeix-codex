from __future__ import annotations

from django.core.exceptions import ValidationError
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from parler.models import TranslatableModel, TranslatedFields
from solo.models import SingletonModel

from core.models import ContentBase


class EventCategorySingleton(SingletonModel):
    """
    Singleton model to hold the default 'Events' category.
    This ensures all events are under a single category hierarchy.
    """

    category = models.ForeignKey(
        "core.Category",
        on_delete=models.PROTECT,
        related_name="event_singleton",
        verbose_name=_("Events Category"),
        help_text=_("The root category for all events"),
    )

    class Meta:
        verbose_name = _("Events Category Configuration")

    def __str__(self) -> str:
        return f"Events Category: {self.category}"

    @classmethod
    def get_default_category(cls):
        """Get the default events category safely."""
        try:
            singleton = cls.objects.filter(pk=1).first()
            return singleton.category if singleton and singleton.category_id else None
        except Exception:
            return None


class Event(ContentBase, TranslatableModel):
    """
    Event model with multilingual support via django-parler.
    Inherits slug and audit fields from ContentBase.
    """

    translations = TranslatedFields(
        title=models.CharField(_("Title"), max_length=200),
        summary=models.CharField(_("Summary"), max_length=280, blank=True, default=""),
        description=models.TextField(_("Description"), blank=True),
    )

    category = models.ForeignKey(
        "core.Category",
        on_delete=models.PROTECT,
        related_name="events",
        null=True,
        blank=True,
        verbose_name=_("Category"),
        help_text=_("Category for this event (defaults to Events category)"),
    )

    start_at = models.DateTimeField(_("Start at"), null=True, blank=True)
    end_at = models.DateTimeField(_("End at"), null=True, blank=True)
    is_published = models.BooleanField(_("Is published"), default=True)
    points_value = models.PositiveIntegerField(
        _("Points value"),
        default=20,
        help_text=_("Points awarded for event check-in."),
    )

    venue_name = models.CharField(
        _("Venue name"),
        max_length=200,
        blank=True,
        help_text=_("Name of the venue or organizer (free text)."),
    )

    # Placeholder for future place model integration.
    location_text = models.CharField(
        max_length=255,
        blank=True,
        help_text=_(
            "Free text location. TODO: replace with Place relation when available."
        ),
    )

    is_outdoor = models.BooleanField(
        _("Is outdoor"),
        default=False,
        help_text=_("Mark if the event takes place outdoors to show weather info."),
    )

    is_featured = models.BooleanField(_("Is featured"), default=False)
    is_free = models.BooleanField(_("Is free"), default=True)
    price = models.DecimalField(
        _("Price"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Optional price for the event (indicative)."),
    )
    price_text = models.CharField(
        _("Price text"),
        max_length=120,
        blank=True,
        default="",
        help_text=_("Optional display price (e.g. '10 €', 'Free entry')."),
    )

    tags = models.ManyToManyField(
        "core.Tag",
        blank=True,
        related_name="events",
        verbose_name=_("Tags"),
        help_text=_("Tags linked to this event."),
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

    class Meta:
        ordering = ("start_at", "id")
        verbose_name = _("Event")
        verbose_name_plural = _("Events")

    def __str__(self) -> str:
        title = self.safe_translation_getter("title", any_language=True) or _("Event")
        return f"{title} @ {self.start_at}"

    def is_future(self) -> bool:
        return self.start_at > timezone.now()

    def update_cached_dates(self):
        """
        Update start_at/end_at based on the nearest upcoming EventDate.
        If no future dates, use the last past date.
        """
        now = timezone.now()
        # Find next future session
        next_session = self.dates.filter(start_at__gte=now).order_by("start_at").first()

        if not next_session:
            # Fallback to last past session if no future ones
            next_session = self.dates.order_by("-start_at").first()

        if next_session:
            self.start_at = next_session.start_at
            self.end_at = next_session.end_at
            # Avoid triggering signals recursively if called from signal
            super().save(update_fields=["start_at", "end_at"])

    # Backward compatibility properties for API
    @property
    def created_at(self):
        """Alias for fecha_creacion from BaseModel."""
        return self.fecha_creacion

    @property
    def updated_at(self):
        """Alias for fecha_modificacion from BaseModel."""
        return self.fecha_modificacion

    def clean(self) -> None:
        super().clean()
        if self.end_at and self.end_at < self.start_at:
            raise ValidationError(
                {"end_at": _("End date cannot be before start date.")}
            )

    def save(self, *args, **kwargs):
        # Auto-assign default category if not set
        if not self.category_id:
            default_category = EventCategorySingleton.get_default_category()
            if default_category:
                self.category = default_category

        # ContentBase handles slug generation, but we override to use translated title
        if not self.slug:
            self.slug = self._generate_unique_slug()

        self.full_clean()
        super().save(*args, **kwargs)

    def _generate_unique_slug(self) -> str:
        """
        Generate a unique slug based on the translated title.
        """
        from django.utils.text import slugify

        if self.pk:
            base_title = (
                self.safe_translation_getter("title", any_language=True) or "event"
            )
        else:
            base_title = getattr(self, "title", None) or "event"
        base_slug = slugify(base_title) or "event"
        slug_candidate = base_slug
        counter = 2

        while Event.objects.filter(slug=slug_candidate).exclude(pk=self.pk).exists():
            slug_candidate = f"{base_slug}-{counter}"
            counter += 1

        return slug_candidate


class EventDate(models.Model):
    """
    Individual session/date for an event.
    Events can have multiple dates (e.g. a course happening every Monday).
    """

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="dates",
        verbose_name=_("Event"),
    )
    start_at = models.DateTimeField(_("Start at"))
    end_at = models.DateTimeField(_("End at"), null=True, blank=True)

    class Meta:
        ordering = ("start_at",)
        verbose_name = _("Event Date")
        verbose_name_plural = _("Event Dates")

    def __str__(self):
        return f"{self.start_at} ({self.event.title})"

    def clean(self):
        if self.end_at and self.end_at < self.start_at:
            raise ValidationError(
                {"end_at": _("End date cannot be before start date.")}
            )

        # Check for overlapping sessions for the same event
        # Overlap logic: (start1 < end2) AND (end1 > start2)
        # We treat null end_at as equal to start_at (point in time)
        start = self.start_at
        end = self.end_at or self.start_at

        overlaps = EventDate.objects.filter(
            event=self.event,
            start_at__lt=end,
        ).filter(
            models.Q(end_at__gt=start)
            | models.Q(end_at__isnull=True, start_at__gt=start)
        )

        if self.pk:
            overlaps = overlaps.exclude(pk=self.pk)

        if overlaps.exists():
            raise ValidationError(
                _(
                    "This session overlaps with another existing session for the same event."
                )
            )


class UserFavoriteEvent(models.Model):
    """Eventos favoritos del usuario."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorite_events",
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="favorited_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "event"]
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"{self.user} -> {self.event}"
