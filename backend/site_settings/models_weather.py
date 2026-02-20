from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import BaseModel


class MunicipalityWeather(BaseModel):
    """
    Stores the weather forecast for the municipality (Cabrera de Mar).
    Updated periodically via management command.
    """

    # Stores the full forecast JSON from Google Weather API (or fallback)
    forecast_data = models.JSONField(
        verbose_name=_("Forecast Data"),
        help_text=_("Detailed JSON forecast for the next 7 days."),
    )

    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Municipality Weather")
        verbose_name_plural = _("Municipality Weather")
        ordering = ("-updated_at",)

    def __str__(self):
        return f"Weather Update - {self.updated_at.strftime('%Y-%m-%d %H:%M')}"
