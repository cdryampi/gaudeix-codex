"""
Seed the Routes category and RouteCategorySingleton.

Idempotent: safe to run multiple times.
"""

from __future__ import annotations

from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Category
from core.seed_media import ensure_image_file
from routes.models import RouteCategorySingleton


class Command(BaseCommand):
    help = "Seed the routes category and singleton (idempotent)."

    def handle(self, *args, **options):
        with transaction.atomic():
            self._seed_category()

    def _seed_category(self) -> None:
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

        self._apply_featured_image(category, "cami-de-ronda-cabrera.png")

        translations = {
            "ca": "Rutes",
            "es": "Rutas",
            "en": "Routes",
            "fr": "Itineraires",
        }
        for language_code, name in translations.items():
            category.set_current_language(language_code)
            if category.nombre != name:
                category.nombre = name
                category.save()

        singleton, _ = RouteCategorySingleton.objects.get_or_create(
            pk=1, defaults={"category": category}
        )
        if singleton.category != category:
            singleton.category = category
            singleton.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{action} routes category: {category}"))

    def _apply_featured_image(self, category: Category, image_name: str) -> None:
        image_path = (
            Path(__file__).resolve().parents[3]
            / "seed_assets"
            / "routes"
            / "images"
            / image_name
        )
        if not image_path.exists():
            return

        image = ensure_image_file(image_path).instance
        if category.featured_media_id != image.id:
            category.featured_media = image
            category.save(update_fields=["featured_media"])
