"""App configuration for gamification signals and models."""

from django.apps import AppConfig


class GamificationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "gamification"

    def ready(self) -> None:
        from . import signals  # noqa: F401
