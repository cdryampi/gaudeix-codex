"""
Seed the Festes category and FestaCategorySingleton.

Idempotent: safe to run multiple times.
"""

from __future__ import annotations

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Category
from festes.models import FestaCategorySingleton


class Command(BaseCommand):
    help = "Seed the festes category and singleton (idempotent)."

    def handle(self, *args, **options):
        with transaction.atomic():
            self._seed_category()

    def _seed_category(self) -> None:
        # Create or update root category
        category, created = Category.objects.get_or_create(
            slug="festes",
            defaults={
                "nombre": "Festes",
                "taxonomy": Category.TaxonomyChoices.FESTES,
                "icon": "agenda",
            },
        )

        if not created:
            updated = False
            if category.taxonomy != Category.TaxonomyChoices.FESTES:
                category.taxonomy = Category.TaxonomyChoices.FESTES
                updated = True
            if category.icon != "agenda":
                category.icon = "agenda"
                updated = True
            if updated:
                category.save()

        # Add translations
        translations = {
            "ca": "Festes",
            "es": "Fiestas",
            "en": "Festivals",
            "fr": "Fêtes",
        }
        for lang, name in translations.items():
            category.set_current_language(lang)
            if category.nombre != name:
                category.nombre = name
                category.save()

        # Create singleton
        singleton, _ = FestaCategorySingleton.objects.get_or_create(
            pk=1, defaults={"category": category}
        )
        if singleton.category != category:
            singleton.category = category
            singleton.save()

        self._apply_featured_image(category, "festa-major-cabrera-2025.png")

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{action} festes category: {category}"))

    def _apply_featured_image(self, category: Category, image_name: str) -> None:
        from core.seed_media import ensure_image_file
        from pathlib import Path

        image_path = (
            Path(__file__).resolve().parents[3]
            / "seed_assets"
            / "festes"
            / "images"
            / image_name
        )
        if not image_path.exists():
            return

        image = ensure_image_file(image_path).instance
        if category.featured_media_id != image.id:
            category.featured_media = image
            category.save(update_fields=["featured_media"])
