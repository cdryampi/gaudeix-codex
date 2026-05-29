"""
Seed the Places category, template categories and PlaceCategorySingleton.

Idempotent: safe to run multiple times.
"""

from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.core.management.base import CommandError
from django.db import transaction

from core.models import Category
from core.seed_media import ensure_image_file
from places.models import Place, PlaceCategorySingleton


class Command(BaseCommand):
    help = "Seed the Places category, template categories and assign root to existing places"

    def handle(self, *args, **options):
        seed_data = self._load_seed_data()
        with transaction.atomic():
            root_category = self._create_root_category(seed_data["root"])
            self._create_template_categories(seed_data.get("templates", []) or [])
            singleton = self._create_singleton(
                root_category, pk=seed_data.get("singleton_pk", 1)
            )
            assigned = 0
            if seed_data.get("assign_root_to_existing_places", True):
                assigned = self._assign_root_to_places(root_category)
            self._print_summary(root_category, singleton, assigned)

    def _create_root_category(self, definition: dict) -> Category:
        slug = definition["slug"]
        icon = definition.get("icon", "")
        translations = definition.get("translations", {}) or {}
        descriptions = definition.get("descriptions", {}) or {}
        featured_image_name = definition.get("featured_image")

        category, created = Category.objects.get_or_create(
            slug=slug,
            defaults={
                "nombre": translations.get("en") or slug,
                "icon": icon,
            },
        )

        if not created and icon and category.icon != icon:
            category.icon = icon
            category.save(update_fields=["icon"])

        for lang_code, name in translations.items():
            category.set_current_language(lang_code)
            if category.nombre != name:
                category.nombre = name
                category.save()

        for lang_code, desc in descriptions.items():
            category.set_current_language(lang_code)
            if category.descripcion != desc:
                category.descripcion = desc
                category.save()

        if featured_image_name:
            self._apply_featured_image(category, featured_image_name)

        if created:
            self.stdout.write(self.style.SUCCESS(f"Created root category '{slug}'"))
        else:
            self.stdout.write(self.style.WARNING(f"Root category '{slug}' updated"))
        return category

    def _create_template_categories(self, templates: list[dict]) -> None:
        for entry in templates:
            slug = entry["slug"]
            names = entry.get("translations", {}) or {}
            descs = entry.get("descriptions", {}) or {}
            icon = entry.get("icon", "")
            featured_image_name = entry.get("featured_image")

            category, created = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "nombre": names.get("en", slug),
                    "taxonomy": "template",
                    "icon": icon,
                },
            )
            if category.taxonomy != "template":
                category.taxonomy = "template"
                category.save(update_fields=["taxonomy"])
            
            if icon and category.icon != icon:
                category.icon = icon
                category.save(update_fields=["icon"])

            for lang_code, name in names.items():
                category.set_current_language(lang_code)
                if category.nombre != name:
                    category.nombre = name
                    category.save()

            for lang_code, desc in descs.items():
                category.set_current_language(lang_code)
                if category.descripcion != desc:
                    category.descripcion = desc
                    category.save()

            if featured_image_name:
                self._apply_featured_image(category, featured_image_name)

            if created:
                self.stdout.write(self.style.SUCCESS(f"Created template category '{slug}'"))
            else:
                self.stdout.write(self.style.WARNING(f"Template category '{slug}' updated"))

    def _apply_featured_image(self, category: Category, image_name: str) -> None:
        assets_dir = Path(__file__).resolve().parents[4] / "seed_assets" / "places" / "images"
        if not assets_dir.exists():
            assets_dir = Path(__file__).resolve().parents[3] / "seed_assets" / "places" / "images"
        image_path = assets_dir / image_name

        if not image_path.exists():
            seed_images_dir = Path(__file__).resolve().parents[4] / "seed" / "images"
            if not seed_images_dir.exists():
                seed_images_dir = Path(__file__).resolve().parents[3] / "seed" / "images"
            image_path = seed_images_dir / image_name

        image_file = ensure_image_file(image_path).instance if image_path.exists() else None

        if image_file and category.featured_media != image_file:
            category.featured_media = image_file
            category.save(update_fields=["featured_media"])
            self.stdout.write(self.style.SUCCESS(f"Assigned featured image {image_name} to category {category.slug}"))

    def _create_singleton(self, category: Category, pk: int) -> PlaceCategorySingleton:
        singleton, created = PlaceCategorySingleton.objects.get_or_create(
            pk=pk,
            defaults={"category": category},
        )
        if not created and singleton.category != category:
            singleton.category = category
            singleton.save()
            self.stdout.write(self.style.SUCCESS("Updated PlaceCategorySingleton to root category"))
        elif created:
            self.stdout.write(self.style.SUCCESS("Created PlaceCategorySingleton"))
        else:
            self.stdout.write(self.style.WARNING("PlaceCategorySingleton already configured"))
        return singleton

    def _assign_root_to_places(self, category: Category) -> int:
        places_without_category = Place.objects.filter(category__isnull=True)
        count = places_without_category.count()
        if count:
            places_without_category.update(category=category)
            self.stdout.write(self.style.SUCCESS(f"Assigned root category to {count} place(s)"))
        else:
            self.stdout.write(self.style.WARNING("All places already have a category"))
        return count

    def _print_summary(self, category: Category, singleton: PlaceCategorySingleton, assigned: int) -> None:
        total_places = Place.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"\n{'='*50}\n"
                f"Seed completed successfully\n"
                f"  - Root category: {category.nombre}\n"
                f"  - Total places: {total_places}\n"
                f"  - Singleton points to category: {'yes' if singleton.category == category else 'no'}\n"
                f"  - Places assigned to root: {assigned}\n"
                f"{'='*50}"
            )
        )

    def _load_seed_data(self) -> dict:
        seed_path = Path(__file__).resolve().parents[3] / "seed" / "places_category.json"
        if not seed_path.exists():
             seed_path = Path(__file__).resolve().parents[2] / "seed" / "places_category.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, dict) or "root" not in data:
            raise CommandError(f"Invalid seed data in {seed_path} (missing 'root').")
        return data
