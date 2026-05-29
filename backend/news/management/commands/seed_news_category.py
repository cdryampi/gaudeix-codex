"""
Seed the News category and NewsCategorySingleton.

Idempotent: safe to run multiple times.
Steps:
1) Create/update 'news' category with translations
2) Create/update NewsCategorySingleton pointing to it
3) Assign the category to News without one
"""

from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Category
from core.seed_media import ensure_image_file
from news.models import News, NewsCategorySingleton


class Command(BaseCommand):
    help = "Seed the News category and assign it to all news"

    def handle(self, *args, **options):
        seed_data = self._load_seed_data()
        with transaction.atomic():
            category = self._create_or_update_category(seed_data["root"])
            subcategories = self._create_or_update_subcategories(
                category, seed_data.get("subcategories", []) or []
            )
            singleton = self._create_or_update_singleton(
                category, pk=seed_data.get("singleton_pk", 1)
            )
            assigned = 0
            if seed_data.get("assign_to_existing_news", True):
                assigned = self._assign_category(category)
            self._print_summary(category, subcategories, singleton, assigned)

    def _create_or_update_category(self, definition: dict) -> Category:
        slug = definition["slug"]
        taxonomy = definition.get("taxonomy", "")
        icon = definition.get("icon", "")
        translations = definition.get("translations", {}) or {}
        descriptions = definition.get("descriptions", {}) or {}
        featured_image_name = definition.get("featured_image")

        category, created = Category.objects.get_or_create(
            slug=slug,
            defaults={
                "nombre": translations.get("en") or slug,
                "taxonomy": taxonomy,
                "icon": icon,
            },
        )
        if taxonomy and category.taxonomy != taxonomy:
            category.taxonomy = taxonomy
            category.save(update_fields=["taxonomy"])

        if icon and category.icon != icon:
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
            self.stdout.write(self.style.SUCCESS(f"Created category '{slug}'"))
        else:
            self.stdout.write(self.style.WARNING(f"Category '{slug}' updated"))
        return category

    def _create_or_update_subcategories(
        self, root: Category, definitions: list[dict]
    ) -> int:
        touched = 0
        for entry in definitions:
            slug = entry["slug"]
            names = entry.get("translations", {}) or {}
            descs = entry.get("descriptions", {}) or {}
            icon = entry.get("icon", "")
            featured_image_name = entry.get("featured_image")

            category, created = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "nombre": names.get("en", slug),
                    "taxonomy": root.taxonomy,
                    "parent": root,
                    "icon": icon,
                },
            )

            changed = False
            if category.taxonomy != root.taxonomy:
                category.taxonomy = root.taxonomy
                changed = True
            if category.parent_id != root.id:
                category.parent = root
                changed = True
            if icon and category.icon != icon:
                category.icon = icon
                changed = True

            for lang_code, name in names.items():
                category.set_current_language(lang_code)
                if category.nombre != name:
                    category.nombre = name
                    changed = True

            for lang_code, desc in descs.items():
                category.set_current_language(lang_code)
                if category.descripcion != desc:
                    category.descripcion = desc
                    changed = True

            if featured_image_name:
                self._apply_featured_image(category, featured_image_name)

            if changed:
                category.save()

            if created or changed:
                touched += 1

        return touched

    def _apply_featured_image(self, category: Category, image_name: str) -> None:
        image_path = (
            Path(__file__).resolve().parents[3]
            / "seed_assets"
            / "media_files"
            / "images"
            / image_name
        )
        existing = ensure_image_file(image_path).instance if image_path.exists() else None

        if existing and category.featured_media_id != existing.id:
            category.featured_media = existing
            category.save(update_fields=["featured_media"])

    def _create_or_update_singleton(
        self, category: Category, pk: int
    ) -> NewsCategorySingleton:
        singleton, created = NewsCategorySingleton.objects.get_or_create(
            pk=pk,
            defaults={"category": category},
        )
        if not created and singleton.category != category:
            singleton.category = category
            singleton.save()
            self.stdout.write(self.style.SUCCESS("Updated NewsCategorySingleton"))
        elif created:
            self.stdout.write(self.style.SUCCESS("Created NewsCategorySingleton"))
        else:
            self.stdout.write(
                self.style.WARNING("NewsCategorySingleton already configured")
            )
        return singleton

    def _assign_category(self, category: Category) -> int:
        news_without_category = News.objects.filter(category__isnull=True)
        count = news_without_category.count()
        if count:
            news_without_category.update(category=category)
            self.stdout.write(
                self.style.SUCCESS(f"Assigned category to {count} news item(s)")
            )
        else:
            self.stdout.write(self.style.WARNING("All news already have a category"))
        return count

    def _print_summary(
        self,
        category: Category,
        subcategories: int,
        singleton: NewsCategorySingleton,
        assigned: int,
    ) -> None:
        total_news = News.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"\n{'=' * 50}\n"
                f"Seed completed\n"
                f"  - News category: {category.nombre}\n"
                f"  - Subcategories touched: {subcategories}\n"
                f"  - Total news: {total_news}\n"
                f"  - Singleton points to category: {'yes' if singleton.category == category else 'no'}\n"
                f"  - News updated: {assigned}\n"
                f"{'=' * 50}"
            )
        )

    def _load_seed_data(self) -> dict:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "news_category.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, dict) or "root" not in data:
            raise CommandError(f"Invalid seed data in {seed_path} (missing 'root').")
        return data
