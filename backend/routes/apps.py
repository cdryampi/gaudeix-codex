"""Routes app configuration."""

from django.apps import AppConfig


class RoutesConfig(AppConfig):
    """Routes app for hiking and cycling routes with GPS tracks."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "routes"
    verbose_name = "Rutes"
