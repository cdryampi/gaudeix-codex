from django.db import models
from django.utils.translation import gettext_lazy as _
from parler.models import TranslatableModel, TranslatedFields
from simple_history.models import HistoricalRecords

from .utils import validate_hex_color
from django.core.exceptions import ValidationError

def validator_hex(value):
    if not validate_hex_color(value):
        raise ValidationError(
            _('%(value)s is not a valid hex color'),
            params={'value': value},
        )

class SocialLink(TranslatableModel):
    translations = TranslatedFields(
        name=models.CharField(_("Name"), max_length=50)
    )
    url = models.URLField(_("URL"))
    icon_class = models.CharField(
        _("Icon Class"), 
        max_length=50, 
        help_text=_("FontAwesome class, e.g., 'fa-brands fa-facebook'")
    )
    color = models.CharField(
        _("Color"),
        max_length=7,
        default="#000000",
        validators=[validator_hex],
        help_text=_("Hex color code, e.g., #FFFFFF")
    )
    available_in_ca = models.BooleanField(_("Available in Catalan"), default=True)
    available_in_es = models.BooleanField(_("Available in Spanish"), default=True)
    available_in_en = models.BooleanField(_("Available in English"), default=True)
    available_in_fr = models.BooleanField(_("Available in French"), default=True)
    
    order = models.PositiveIntegerField(_("Order"), default=0)
    is_active = models.BooleanField(_("Is Active"), default=True)
    
    # Historical tracking
    history = HistoricalRecords()

    class Meta:
        verbose_name = _("Social Link")
        verbose_name_plural = _("Social Links")
        ordering = ["order"]

    def __str__(self):
        name = self.safe_translation_getter("name", any_language=True)
        return name if name else f"SocialLink {self.id}"
