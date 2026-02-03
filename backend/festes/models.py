"""Models for the festes app.

This module defines Festa and Sponsor models for Festes Majors
and special events that group multiple Events.
"""

from __future__ import annotations

from django.db import models
from django.utils.text import slugify
from parler.models import TranslatableModel, TranslatedFields

from core.models import ContentBase, Category, Tag


class Festa(TranslatableModel, ContentBase):
    """
    Festa Major o evento especial que agrupa múltiples eventos.

    Ejemplo: "Festa Major de Cabrera 2025" con conciertos, actos, etc.
    """

    translations = TranslatedFields(
        title=models.CharField(max_length=200, verbose_name="Títol"),
        subtitle=models.CharField(max_length=300, blank=True, verbose_name="Subtítol"),
        summary=models.TextField(blank=True, verbose_name="Resum"),
        description=models.TextField(blank=True, verbose_name="Descripció"),
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
    poster = models.ForeignKey(
        "media_files.ImageFile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="posters_festes",
        verbose_name="Cartell oficial",
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

    # Relation with events
    events = models.ManyToManyField(
        "events.Event",
        blank=True,
        related_name="part_of_festa",
        verbose_name="Esdeveniments",
    )

    # Status
    is_published = models.BooleanField(default=False, verbose_name="Publicada")
    is_featured = models.BooleanField(default=False, verbose_name="Destacada")
    is_current = models.BooleanField(
        default=False,
        verbose_name="És la festa actual",
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

    PLATINUM = "platinum", "Platí"
    GOLD = "gold", "Or"
    SILVER = "silver", "Plata"
    BRONZE = "bronze", "Bronze"
    COLLABORATOR = "collaborator", "Col·laborador"


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
    """Singleton para la categoría raíz de festes."""

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
        return f"Festes → {self.category}"
