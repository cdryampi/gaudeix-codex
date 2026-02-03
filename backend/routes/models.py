"""Models for the routes app.

This module defines Route, RouteWaypoint, and RouteCategorySingleton models
for hiking and cycling routes with GPS track support.
"""

from __future__ import annotations

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from parler.models import TranslatableModel, TranslatedFields

from core.models import ContentBase, Category, Tag


class DifficultyChoices(models.TextChoices):
    """Difficulty levels for routes."""

    EASY = "easy", "Fàcil"
    MODERATE = "moderate", "Moderada"
    DIFFICULT = "difficult", "Difícil"
    EXPERT = "expert", "Expert"


class RouteTypeChoices(models.TextChoices):
    """Types of routes."""

    WALKING = "walking", "A peu"
    CYCLING = "cycling", "Bicicleta"
    GUIDED = "guided", "Guiada"
    MIXED = "mixed", "Mixta"


class Route(TranslatableModel, ContentBase):
    """
    Ruta/itinerario con soporte para tracks GPS.

    Hereda: slug, auditoría (creado_por, fecha_creacion...), SEO (metatitulo...)
    """

    translations = TranslatedFields(
        title=models.CharField(max_length=200, verbose_name="Títol"),
        summary=models.TextField(blank=True, verbose_name="Resum"),
        description=models.TextField(blank=True, verbose_name="Descripció"),
        instructions=models.TextField(blank=True, verbose_name="Instruccions"),
    )

    # Classification
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="routes",
        verbose_name="Categoria",
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="routes")
    route_type = models.CharField(
        max_length=20,
        choices=RouteTypeChoices.choices,
        default=RouteTypeChoices.WALKING,
        verbose_name="Tipus de ruta",
    )

    # Technical characteristics
    difficulty = models.CharField(
        max_length=20,
        choices=DifficultyChoices.choices,
        default=DifficultyChoices.MODERATE,
        verbose_name="Dificultat",
    )
    distance_km = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Distància (km)",
    )
    duration_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Duració (minuts)",
    )
    elevation_gain = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Desnivell positiu (m)",
    )
    elevation_loss = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Desnivell negatiu (m)",
    )

    # Geolocation
    start_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
        verbose_name="Latitud inici",
    )
    start_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
        verbose_name="Longitud inici",
    )
    end_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
        verbose_name="Latitud fi",
    )
    end_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
        verbose_name="Longitud fi",
    )
    is_circular = models.BooleanField(default=False, verbose_name="Ruta circular")

    # GPS Track (GPX/KML file)
    gpx_file = models.ForeignKey(
        "media_files.DocumentFile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="routes_gpx",
        verbose_name="Arxiu GPX/KML",
    )

    # Parsed track data (GeoJSON for frontend rendering)
    track_geojson = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Track GeoJSON",
        help_text="LineString o MultiLineString en format GeoJSON",
    )

    # Media
    featured_media = models.ForeignKey(
        "media_files.ImageFile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="featured_in_routes",
        verbose_name="Imatge destacada",
    )
    attachments = models.ManyToManyField(
        "media_files.DocumentFile",
        blank=True,
        related_name="attached_to_routes",
        verbose_name="Documents adjunts",
    )
    gallery = models.ManyToManyField(
        "media_files.ImageFile",
        blank=True,
        related_name="in_route_galleries",
        verbose_name="Galeria d'imatges",
    )

    # Status
    is_published = models.BooleanField(default=False, verbose_name="Publicada")
    is_featured = models.BooleanField(default=False, verbose_name="Destacada")

    # Waypoints (points of interest along the route)
    waypoints = models.ManyToManyField(
        "places.Place",
        through="RouteWaypoint",
        related_name="on_routes",
        verbose_name="Punts d'interès",
    )

    class Meta:
        verbose_name = "Ruta"
        verbose_name_plural = "Rutes"
        ordering = ("-fecha_creacion",)

    def __str__(self) -> str:
        title = self.safe_translation_getter("title", any_language=True)
        return title if title else self.slug

    def save(self, *args, **kwargs):
        """Auto-generate slug from title if not provided."""
        if not self.slug:
            title = self.safe_translation_getter("title", any_language=True)
            if title:
                base_slug = slugify(title)
                slug = base_slug
                counter = 1
                while Route.objects.filter(slug=slug).exclude(pk=self.pk).exists():
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
    def duration_formatted(self) -> str:
        """Return duration in human-readable format (e.g., '2h 30min')."""
        if not self.duration_minutes:
            return ""
        hours = self.duration_minutes // 60
        minutes = self.duration_minutes % 60
        if hours and minutes:
            return f"{hours}h {minutes}min"
        elif hours:
            return f"{hours}h"
        else:
            return f"{minutes}min"


class RouteWaypoint(models.Model):
    """Punto intermedio de una ruta (relaciona Route con Place)."""

    route = models.ForeignKey(
        Route,
        on_delete=models.CASCADE,
        related_name="route_waypoints",
    )
    place = models.ForeignKey(
        "places.Place",
        on_delete=models.CASCADE,
        related_name="waypoint_routes",
    )
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre")

    # Specific instructions to reach this point
    instructions = models.TextField(blank=True, verbose_name="Instruccions")
    distance_from_previous_km = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Distància des de l'anterior (km)",
    )

    class Meta:
        ordering = ("order",)
        unique_together = ("route", "order")
        verbose_name = "Waypoint"
        verbose_name_plural = "Waypoints"

    def __str__(self) -> str:
        place_name = self.place.safe_translation_getter("title", any_language=True)
        return f"{self.order}. {place_name}"


class RouteCategorySingleton(models.Model):
    """Singleton para la categoría raíz de rutas."""

    category = models.OneToOneField(
        Category,
        on_delete=models.PROTECT,
        verbose_name="Categoria de rutes",
    )

    class Meta:
        verbose_name = "Route Category Singleton"
        verbose_name_plural = "Route Category Singleton"

    def save(self, *args, **kwargs):
        """Ensure only one instance exists."""
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"Routes → {self.category}"
