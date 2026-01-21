from __future__ import annotations

from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from parler.models import TranslatableModel, TranslatedFields
from solo.models import SingletonModel

from core.models import ContentBase


class PlaceCategorySingleton(SingletonModel):
    """
    Singleton model to hold the default 'Places' category.
    Ensures all places share a common root category.
    """

    category = models.ForeignKey(
        "core.Category",
        on_delete=models.PROTECT,
        related_name="place_singleton",
        verbose_name=_("Places Category"),
        help_text=_("Root category for all places"),
    )

    class Meta:
        verbose_name = _("Places Category Configuration")

    def __str__(self) -> str:
        return f"Places Category: {self.category}"

    @classmethod
    def get_default_category(cls):
        """Get the default places category, creating singleton if needed."""
        singleton = cls.get_solo()
        return singleton.category if singleton.category_id else None


class Place(ContentBase, TranslatableModel):
    """
    Place model with multilingual support via django-parler.
    Inherits slug and audit fields from ContentBase.
    """

    translations = TranslatedFields(
        title=models.CharField(_("Title"), max_length=200),
        description=models.TextField(_("Description"), blank=True),
    )

    category = models.ForeignKey(
        "core.Category",
        on_delete=models.PROTECT,
        related_name="places",
        null=True,
        blank=True,
        verbose_name=_("Category"),
        help_text=_("Category for this place (defaults to Places category)"),
    )
    is_published = models.BooleanField(_("Is published"), default=True)

    latitude = models.FloatField(
        _("Latitude"),
        null=True,
        blank=True,
        help_text=_("Latitude in decimal degrees (-90 to 90)"),
    )
    longitude = models.FloatField(
        _("Longitude"),
        null=True,
        blank=True,
        help_text=_("Longitude in decimal degrees (-180 to 180)"),
    )
    location_text = models.CharField(
        _("Location (text)"),
        max_length=255,
        blank=True,
        help_text=_("Free text address or location description."),
    )
    phone = models.CharField(_("Phone"), max_length=50, blank=True)
    email = models.EmailField(_("Email"), blank=True)
    website = models.URLField(_("Website"), blank=True)
    booking_url = models.URLField(_("Booking URL"), blank=True)

    featured_media = models.ForeignKey(
        "media_files.ImageFile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="featured_in_places",
        verbose_name=_("Featured media"),
    )
    attachments = models.ManyToManyField(
        "media_files.DocumentFile",
        blank=True,
        related_name="attached_to_places",
        verbose_name=_("Attachments"),
        help_text=_("Document attachments linked to this place."),
    )

    class Meta:
        ordering = ("slug", "id")
        verbose_name = _("Place")
        verbose_name_plural = _("Places")

    def __str__(self) -> str:
        title = self.safe_translation_getter("title", any_language=True) or _("Place")
        return f"{title}"

    @property
    def created_at(self):
        """Alias for fecha_creacion from BaseModel."""
        return self.fecha_creacion

    @property
    def updated_at(self):
        """Alias for fecha_modificacion from BaseModel."""
        return self.fecha_modificacion

    @property
    def template_key(self) -> str | None:
        """Expose template key derived from the category slug."""
        if self.category:
            return self.category.slug
        return None

    def clean(self) -> None:
        super().clean()
        if self.latitude is not None and (self.latitude < -90 or self.latitude > 90):
            raise ValidationError(
                {"latitude": _("Latitude must be between -90 and 90.")}
            )
        if self.longitude is not None and (
            self.longitude < -180 or self.longitude > 180
        ):
            raise ValidationError(
                {"longitude": _("Longitude must be between -180 and 180.")}
            )
        if (self.latitude is None) != (self.longitude is None):
            raise ValidationError(
                _("Both latitude and longitude must be set together.")
            )

    def save(self, *args, **kwargs):
        # Auto-assign default category if not set
        if not self.category_id:
            default_category = PlaceCategorySingleton.get_default_category()
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
                self.safe_translation_getter("title", any_language=True) or "place"
            )
        else:
            base_title = getattr(self, "title", None) or "place"
        base_slug = slugify(base_title) or "place"
        slug_candidate = base_slug
        counter = 2

        while Place.objects.filter(slug=slug_candidate).exclude(pk=self.pk).exists():
            slug_candidate = f"{base_slug}-{counter}"
            counter += 1

        return slug_candidate


class Restaurant(Place):
    """
    Specialized Place model for Restaurants/Bars.
    Inherits all Place fields and adds specific dining attributes.
    """

    CUISINE_TYPES = [
        ("mediterranean", _("Mediterranean")),
        ("italian", _("Italian")),
        ("asian", _("Asian")),
        ("fast_food", _("Fast Food")),
        ("traditional", _("Traditional")),
        ("tapas", _("Tapas")),
        ("vegan", _("Vegan/Vegetarian")),
        ("other", _("Other")),
    ]

    cuisine_type = models.CharField(
        _("Cuisine Type"),
        max_length=50,
        choices=CUISINE_TYPES,
        default="other",
    )

    amenities = models.JSONField(
        _("Amenities"),
        default=dict,
        blank=True,
        help_text=_(
            "JSON object with boolean flags: wifi, terrace, pet_friendly, etc."
        ),
    )

    capacity = models.PositiveIntegerField(
        _("Capacity"),
        null=True,
        blank=True,
        help_text=_("Total seating capacity"),
    )

    class Meta:
        verbose_name = _("Restaurant")
        verbose_name_plural = _("Restaurants")


class Accommodation(Place):
    """
    Specialized Place model for Hotels, Hostels, etc.
    Inherits all Place fields and adds lodging attributes.
    """

    ACCOMMODATION_TYPES = [
        ("hotel", _("Hotel")),
        ("hostel", _("Hostel")),
        ("apartment", _("Apartment")),
        ("campsite", _("Campsite")),
        ("rural", _("Rural House")),
        ("other", _("Other")),
    ]

    type = models.CharField(
        _("Accommodation Type"),
        max_length=50,
        choices=ACCOMMODATION_TYPES,
        default="hotel",
    )

    stars = models.PositiveSmallIntegerField(
        _("Stars"),
        null=True,
        blank=True,
        help_text=_("Star rating (1-5)"),
    )

    amenities = models.JSONField(
        _("Amenities"),
        default=dict,
        blank=True,
        help_text=_("JSON object with boolean flags: wifi, pool, parking, ac, etc."),
    )

    check_in_time = models.TimeField(_("Check-in Time"), null=True, blank=True)
    check_out_time = models.TimeField(_("Check-out Time"), null=True, blank=True)

    class Meta:
        verbose_name = _("Accommodation")
        verbose_name_plural = _("Accommodations")
