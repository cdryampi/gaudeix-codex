"""
Scraper app configuration.

This app provides a pluggable system for scraping news from multiple
municipal websites (ayuntamientos) with source-specific parsers.
"""

from django.apps import AppConfig


class ScraperConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "scraper"
    verbose_name = "News Scraper"

    def ready(self):
        # Auto-discover and register parsers
        from scraper.parsers import cabrera_de_mar  # noqa: F401
