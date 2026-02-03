"""
Seed the Routes category and RouteCategorySingleton.

Idempotent: safe to run multiple times.
"""

from __future__ import annotations

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Category
from routes.models import RouteCategorySingleton


class Command(BaseCommand):
    help = "Seed the routes category and singleton (idempotent)."

    def handle(self, *args, **options):
        with transaction.atomic():
            self._seed_category()

    def _seed_category(self) -> None:
        # Create or update root category
        category, created = Category.objects.get_or_create(
            slug="routes",
            defaults={
                "nombre": "Routes",
                "taxonomy": Category.TaxonomyChoices.ROUTES,
                "icon": "route",
            },
        )

        if not created:
            updated = False
            if category.taxonomy != Category.TaxonomyChoices.ROUTES:
                category.taxonomy = Category.TaxonomyChoices.ROUTES
                updated = True
            if not category.icon:
                category.icon = "route"
                updated = True
            if updated:
                category.save()

        # Add translations
        translations = {
            "ca": "Rutes",
            "es": "Rutas",
            "en": "Routes",
            "fr": "Itinéraires",
        }
        for lang, name in translations.items():
            category.set_current_language(lang)
            if category.nombre != name:
                category.nombre = name
                category.save()

        # Create singleton
        singleton, _ = RouteCategorySingleton.objects.get_or_create(
            pk=1, defaults={"category": category}
        )
        if singleton.category != category:
            singleton.category = category
            singleton.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{action} routes category: {category}"))
