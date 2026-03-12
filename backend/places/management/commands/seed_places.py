"""
Management command to seed example places with translations and media attachments.

Usage: python manage.py seed_places [--dry-run]
"""

from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Category
from core.seed_media import ensure_media_from_manifest
from core.seed_manifest import load_seed_asset_manifest, render_dry_run
from media_files.models import DocumentFile, ImageFile
from places.models import Place, PlaceCategorySingleton


class Command(BaseCommand):
    help = (
        "Seed example places with multilingual titles/descriptions. "
        "Check media files and categories before running."
    )

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Print resolved asset attachments and exit.")

    def handle(self, *args, **options):
        manifest_entries = self._load_asset_manifest()
        if options.get("dry_run"):
            self.stdout.write(render_dry_run(manifest_entries, title="places asset manifest"))
            return

        self.stdout.write(self.style.WARNING("Seeding sample places. Verify media files before use."))
        with transaction.atomic():
            root_category = self._ensure_root_category()
            self._clear_places()
            images_by_key, fallback_images, default_docs = self._ensure_media_files(manifest_entries)
            self._create_places(root_category, images_by_key, fallback_images, default_docs)

    def _load_asset_manifest(self):
        return load_seed_asset_manifest(
            manifest_path=Path(__file__).resolve().parents[2] / "seed" / "places_assets.yaml",
            assets_root=Path(__file__).resolve().parent,
            allowed_types={"image", "document"},
            allowed_attach_to={"featured_media", "featured_media_fallback", "attachment_default"},
        )

    def _ensure_root_category(self) -> Category:
        category, _ = Category.objects.get_or_create(slug="places", defaults={"nombre": "Places"})
        singleton, _ = PlaceCategorySingleton.objects.get_or_create(pk=1, defaults={"category": category})
        if singleton.category != category:
            singleton.category = category
            singleton.save()
        return category

    def _clear_places(self) -> None:
        count = Place.objects.count()
        Place.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Removed {count} existing places."))

    def _create_places(
        self,
        root_category: Category,
        images_by_key: dict[str, ImageFile],
        fallback_images: list[ImageFile],
        default_docs: list[DocumentFile],
    ) -> None:
        places_data = self._load_seed_places()

        for index, data in enumerate(places_data):
            category = Category.objects.filter(slug=data.get("category_slug")).first() or root_category
            image_key = data.get("image_filename")
            featured_media = images_by_key.get(image_key or "")
            if not featured_media:
                featured_media = self._pick_media(fallback_images, index)

            place = Place.objects.create(
                title=data["title"],
                description=data.get("description", ""),
                location_text=data.get("location_text", ""),
                latitude=data.get("latitude"),
                longitude=data.get("longitude"),
                category=category,
                featured_media=featured_media,
            )

            if default_docs:
                place.attachments.add(default_docs[index % len(default_docs)])

            self._apply_translations(place, data.get("translations", {}))
            self.stdout.write(self.style.SUCCESS(f"Created place '{place}'"))

    def _load_seed_places(self) -> list[dict]:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "places.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, list):
            raise CommandError(f"Expected a JSON array in {seed_path}")
        return data

    def _apply_translations(self, place: Place, translations: dict) -> None:
        for language_code, values in translations.items():
            place.set_current_language(language_code)
            place.title = values.get("title", place.title)
            place.description = values.get("description", place.description)
            place.save()

    def _pick_media(self, images: list[ImageFile], index: int):
        if not images:
            return None
        return images[index % len(images)]

    def _ensure_media_files(self, manifest_entries) -> tuple[dict[str, ImageFile], list[ImageFile], list[DocumentFile]]:
        image_map: dict[str, ImageFile] = {}
        fallback_images: list[ImageFile] = []
        default_docs: list[DocumentFile] = []
        media_index = ensure_media_from_manifest(manifest_entries)

        for entry in manifest_entries:
            if entry.type == "image" and entry.attach_to == "featured_media":
                image_map[entry.slug_or_key] = media_index.images[(entry.attach_to, entry.slug_or_key)]
            elif entry.type == "image" and entry.attach_to == "featured_media_fallback":
                fallback_images.append(media_index.images[(entry.attach_to, entry.slug_or_key)])
            elif entry.type == "document" and entry.attach_to == "attachment_default":
                default_docs.append(media_index.documents[(entry.attach_to, entry.slug_or_key)])

        if not fallback_images:
            fallback_images = list(image_map.values())

        return image_map, fallback_images, default_docs
