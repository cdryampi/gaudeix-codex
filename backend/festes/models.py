"""Models for the festes app.

This module defines Festa, Sponsor, Venue and Program models for Festes
Majors and special events that group multiple Events.
"""

from __future__ import annotations

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from parler.models import TranslatableModel, TranslatedFields

from core.models import ContentBase, Category, Tag


def _get_any_translation_value(instance: TranslatableModel, field_name: str) -> str:
    """Return translated field value even before first persistence."""
    try:
        value = instance.safe_translation_getter(field_name, any_language=True)
        return value or ""
    except ValueError:
        pass

    translations_cache = getattr(instance, "_translations_cache", {})
    for translation in translations_cache.values():
        value = getattr(translation, field_name, "")
        if value:
            return value

    return ""


class Festa(TranslatableModel, ContentBase):
    """
    Festa Major o evento especial que agrupa mÃºltiples eventos.

    Ejemplo: "Festa Major de Cabrera 2025" con conciertos, actos, etc.
    """

    translations = TranslatedFields(
        title=models.CharField(max_length=200, verbose_name="TÃ­tol"),
        subtitle=models.CharField(max_length=300, blank=True, verbose_name="SubtÃ­tol"),
        summary=models.TextField(blank=True, verbose_name="Resum"),
        description=models.TextField(blank=True, verbose_name="DescripciÃ³"),
        program_text=models.TextField(blank=True, verbose_name="Programa (text)"),
    )

    # Date range of the festa
    start_date = models.DateField(verbose_name="Data inici")
    end_date = models.DateField(verbose_name="Data fi")
    year = models.PositiveIntegerField(verbose_name="Any")

    # Classification
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="festes",
        verbose_name="Categoria",
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="festes")

    # Media
    featured_media = models.ForeignKey(
        "media_files.ImageFile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="featured_in_festes",
        verbose_name="Cartell / Imatge destacada",
    )
    posters = models.ManyToManyField(
        "media_files.ImageFile",
        blank=True,
        related_name="posters_festes",
        verbose_name="Cartells oficials",
        help_text="Un o mÃ©s cartells de la festa.",
    )
    program_pdf = models.ForeignKey(
        "media_files.DocumentFile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="programs_festes",
        verbose_name="Programa PDF",
    )
    gallery = models.ManyToManyField(
        "media_files.ImageFile",
        blank=True,
        related_name="in_festa_galleries",
        verbose_name="Galeria d'imatges",
    )

    # Relation with events (ordered through FestaEvent)
    events = models.ManyToManyField(
        "events.Event",
        through="FestaEvent",
        blank=True,
        related_name="part_of_festa",
        verbose_name="Esdeveniments",
    )

    # Status
    is_published = models.BooleanField(default=False, verbose_name="Publicada")
    is_featured = models.BooleanField(default=False, verbose_name="Destacada")
    is_current = models.BooleanField(
        default=False,
        verbose_name="Ã‰s la festa actual",
        help_text="Marca la festa que es mostra per defecte",
    )

    class Meta:
        verbose_name = "Festa"
        verbose_name_plural = "Festes"
        ordering = ("-year", "-start_date")
        # Only one festa can be "current" at a time
        constraints = [
            models.UniqueConstraint(
                fields=["is_current"],
                condition=models.Q(is_current=True),
                name="unique_current_festa",
            )
        ]

    def __str__(self) -> str:
        title = self.safe_translation_getter("title", any_language=True)
        return f"{title} ({self.year})" if title else self.slug

    def save(self, *args, **kwargs):
        """Auto-generate slug from title and year if not provided."""
        if not self.slug:
            title = self.safe_translation_getter("title", any_language=True)
            if title:
                base_slug = slugify(f"{title}-{self.year}")
                slug = base_slug
                counter = 1
                while Festa.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                self.slug = slug
        super().save(*args, **kwargs)

    @property
    def created_at(self):
        """Alias for API compatibility."""
        return self.fecha_creacion

    @property
    def updated_at(self):
        """Alias for API compatibility."""
        return self.fecha_modificacion

    @property
    def duration_days(self) -> int:
        """Return the number of days the festa lasts."""
        if self.start_date and self.end_date:
            return (self.end_date - self.start_date).days + 1
        return 0


class SponsorTierChoices(models.TextChoices):
    """Sponsor tier levels."""

    PLATINUM = "platinum", "PlatÃ­"
    GOLD = "gold", "Or"
    SILVER = "silver", "Plata"
    BRONZE = "bronze", "Bronze"
    COLLABORATOR = "collaborator", "ColÂ·laborador"


class Sponsor(models.Model):
    """Patrocinador de una festa."""

    festa = models.ForeignKey(
        Festa,
        on_delete=models.CASCADE,
        related_name="sponsors",
        verbose_name="Festa",
    )
    name = models.CharField(max_length=200, verbose_name="Nom")
    logo = models.ForeignKey(
        "media_files.ImageFile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="sponsor_logos",
        verbose_name="Logotip",
    )
    website = models.URLField(blank=True, verbose_name="Web")
    tier = models.CharField(
        max_length=20,
        choices=SponsorTierChoices.choices,
        default=SponsorTierChoices.COLLABORATOR,
        verbose_name="Nivell",
    )
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre")

    class Meta:
        ordering = ("tier", "order")
        verbose_name = "Patrocinador"
        verbose_name_plural = "Patrocinadors"

    def __str__(self) -> str:
        return self.name


class FestaCategorySingleton(models.Model):
    """Singleton para la categorÃ­a raÃ­z de festes."""

    category = models.OneToOneField(
        Category,
        on_delete=models.PROTECT,
        verbose_name="Categoria de festes",
    )

    class Meta:
        verbose_name = "Festa Category Singleton"
        verbose_name_plural = "Festa Category Singleton"

    def save(self, *args, **kwargs):
        """Ensure only one instance exists."""
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"Festes â†’ {self.category}"


class Venue(TranslatableModel):
    """
    Venue (location) for festa events.

    Fields from contract:
    - name (translated), description (translated)
    - address, postal_code, city
    - latitude, longitude (nullable, validated)
    - is_published, is_accessible
    - slug (auto-generated)
    """

    translations = TranslatedFields(
        name=models.CharField(max_length=200, verbose_name="Nom"),
        description=models.TextField(blank=True, verbose_name="DescripciÃ³"),
    )

    # Address fields
    address = models.CharField(max_length=255, verbose_name="AdreÃ§a")
    postal_code = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Codi Postal",
    )
    city = models.CharField(max_length=200, verbose_name="Ciutat")

    # Geographic coordinates with validation
    latitude = models.FloatField(
        null=True,
        blank=True,
        verbose_name="Latitud",
        help_text="Latitud en graus decimals (-90 a 90)",
    )
    longitude = models.FloatField(
        null=True,
        blank=True,
        verbose_name="Longitud",
        help_text="Longitud en graus decimals (-180 a 180)",
    )

    # Publication and accessibility
    is_published = models.BooleanField(default=True, verbose_name="Publicada")
    is_accessible = models.BooleanField(
        default=False,
        verbose_name="Accessible",
        help_text="Indicar si la ubicaciÃ³ Ã©s accessible per a mobilitat reduÃ¯da",
    )

    # Unique slug
    slug = models.SlugField(max_length=160, unique=True, verbose_name="Slug")

    # Audit timestamps
    fecha_creacion = models.DateTimeField(
        auto_now_add=True, verbose_name="Data creaciÃ³"
    )
    fecha_modificacion = models.DateTimeField(
        auto_now=True, verbose_name="Data modificaciÃ³"
    )

    class Meta:
        verbose_name = "Venue"
        verbose_name_plural = "Venues"
        ordering = ("slug",)
        indexes = [
            models.Index(fields=["slug"]),
        ]

    def __str__(self) -> str:
        name = _get_any_translation_value(self, "name")
        return f"{name}" if name else (self.slug or _("Venue"))

    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided."""
        if not self.slug:
            name = _get_any_translation_value(self, "name") or "unnamed"
            base_slug = slugify(name) or "venue"
            slug = base_slug
            counter = 1
            while Venue.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        self.full_clean()
        super().save(*args, **kwargs)

    def clean(self):
        """Validate latitude and longitude ranges."""
        super().clean()
        if self.latitude is not None and (self.latitude < -90 or self.latitude > 90):
            raise ValidationError({"latitude": _("Latitud debe estar entre -90 y 90.")})
        if self.longitude is not None and (
            self.longitude < -180 or self.longitude > 180
        ):
            raise ValidationError(
                {"longitude": _("Longitud debe estar entre -180 y 180.")}
            )
        if (self.latitude is None) != (self.longitude is None):
            raise ValidationError(
                _("Latitud i longitud s'han de configurar juntes."),
            )

    @property
    def created_at(self):
        """Alias for fecha_creacion from BaseModel."""
        return self.fecha_creacion

    @property
    def updated_at(self):
        """Alias for fecha_modificacion from BaseModel."""
        return self.fecha_modificacion

    @property
    def location(self) -> str:
        """Computed location from address and city for search UX."""
        parts = []
        if self.address:
            parts.append(self.address)
        if self.city:
            parts.append(self.city)
        return ", ".join(parts) if parts else ""


class ProgramStatusChoices(models.TextChoices):
    """Status choices for Program."""

    DRAFT = "draft", "Borrador"
    PUBLISHED = "published", "Publicada"


class Program(TranslatableModel):
    """
    Program within a Festa.

    Fields from contract:
    - festa (FK to Festa)
    - title, subtitle, description (translated)
    - status (draft | published)
    - order (position within festa)
    - start_date, end_date (nullable dates)
    - slug (auto-generated, unique)
    """

    translations = TranslatedFields(
        title=models.CharField(max_length=200, verbose_name="TÃ­tol"),
        subtitle=models.CharField(max_length=300, blank=True, verbose_name="SubtÃ­tol"),
        description=models.TextField(blank=True, verbose_name="DescripciÃ³"),
    )

    # Foreign key to Festa
    festa = models.ForeignKey(
        Festa,
        on_delete=models.CASCADE,
        related_name="programs",
        verbose_name="Festa",
    )

    # Status
    status = models.CharField(
        max_length=20,
        choices=ProgramStatusChoices.choices,
        default=ProgramStatusChoices.DRAFT,
        verbose_name="Estat",
    )

    # Ordering and dates
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre")
    start_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Data inici",
    )
    end_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Data fi",
    )

    # Unique slug
    slug = models.SlugField(max_length=160, unique=True, verbose_name="Slug")

    # Audit timestamps
    fecha_creacion = models.DateTimeField(
        auto_now_add=True, verbose_name="Data creaciÃ³"
    )
    fecha_modificacion = models.DateTimeField(
        auto_now=True, verbose_name="Data modificaciÃ³"
    )

    class Meta:
        verbose_name = "Programa"
        verbose_name_plural = "Programes"
        ordering = ("festa", "order")
        indexes = [
            models.Index(fields=["festa", "order"]),
            models.Index(fields=["slug"]),
        ]

    def __str__(self) -> str:
        title = _get_any_translation_value(self, "title")
        festa_title = (
            self.festa.safe_translation_getter("title", any_language=True)
            if self.festa
            else "Unknown"
        )
        return f"{festa_title} - {title}" if title else (self.slug or _("Program"))

    def save(self, *args, **kwargs):
        """Auto-generate slug from festa slug and title if not provided."""
        if not self.slug:
            title = _get_any_translation_value(self, "title") or "untitled"
            festa_slug = self.festa.slug if self.festa else "festa"
            base_slug = slugify(f"{festa_slug}-{title}") or "program"
            slug = base_slug
            counter = 1
            while Program.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def created_at(self):
        """Alias for fecha_creacion for API compatibility."""
        return self.fecha_creacion

    @property
    def updated_at(self):
        """Alias for fecha_modificacion for API compatibility."""
        return self.fecha_modificacion

    @property
    def is_published(self) -> bool:
        """Derived from status field for API compatibility."""
        return self.status == ProgramStatusChoices.PUBLISHED


class FestaEvent(models.Model):
    """
    Through model to connect Festa and Event with an explicit order.
    On delete cascade is used because these are just link records.
    Deleting a Festa will delete these links, but not the actual Events.
    """
    festa = models.ForeignKey(Festa, on_delete=models.CASCADE)
    event = models.ForeignKey("events.Event", on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Event de Festa"
        verbose_name_plural = "Events de Festa"
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(
                fields=["festa", "event"],
                name="unique_festa_event_link",
            )
        ]

    def __str__(self):
        festa_title = self.festa.safe_translation_getter("title", any_language=True)
        event_title = getattr(self.event, "title", str(self.event_id))
        return f"{festa_title} -> {event_title} (Order: {self.order})"


