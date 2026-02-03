"""Festes app configuration."""

from django.apps import AppConfig


class FestesConfig(AppConfig):
    """Festes app for Festes Majors and special events."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "festes"
    verbose_name = "Festes Majors"
