from django.apps import AppConfig


class MediaFilesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "media_files"

    def ready(self) -> None:
        # Import signals to ensure they are registered when the app is ready.
        from . import signals  # noqa: F401

        return super().ready()
