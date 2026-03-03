"""
Management command to seed example places with translations and media attachments.

Usage: python manage.py seed_places
"""

from __future__ import annotations

import json
import mimetypes
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Category
from core.seed_assets import resolve_seed_asset_dir
from media_files.models import DocumentFile, ImageFile
from places.models import Place, PlaceCategorySingleton


class Command(BaseCommand):
    help = (
        "Seed example places with multilingual titles/descriptions. "
        "Check media files and categories before running."
    )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding sample places. Verify media files before use."))
        with transaction.atomic():
            root_category = self._ensure_root_category()
            self._clear_places()
            images, documents = self._ensure_media_files()
            self._create_places(root_category, images, documents)

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

    def _create_places(self, root_category: Category, images: list[ImageFile], documents: list[DocumentFile]) -> None:
        places_data = self._load_seed_places()

        for index, data in enumerate(places_data):
            category = (
                Category.objects.filter(slug=data.get("category_slug")).first()
                or root_category
            )
            image_filename = data.get("image_filename")
            featured_media = None
            if image_filename:
                # Find the image object by its original_name (handled in _create_image_file)
                featured_media = next((img for img in images if img.original_name == image_filename), None)
            
            if not featured_media:
                featured_media = self._pick_media(images, index)

            place = Place.objects.create(
                title=data["title"],
                description=data.get("description", ""),
                location_text=data.get("location_text", ""),
                latitude=data.get("latitude"),
                longitude=data.get("longitude"),
                category=category,
                featured_media=featured_media,
            )

            if documents:
                place.attachments.add(documents[index % len(documents)])

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

    @property
    def sample_files_dir(self) -> Path:
        return Path(__file__).resolve().parents[2] / "tests" / "files"

    @property
    def sample_images_dir(self) -> Path:
        return resolve_seed_asset_dir(
            domain="places",
            asset_type="images",
            legacy_dir=Path(__file__).resolve().parent / "images",
            warning_writer=lambda msg: self.stdout.write(self.style.WARNING(msg)),
        )

    def _ensure_media_files(self) -> tuple[list[ImageFile], list[DocumentFile]]:
        images = list(ImageFile.objects.all())
        documents = list(DocumentFile.objects.all())

        # Prefer bundled seed images in management/commands/images
        images_dir = self.sample_images_dir
        if images_dir.exists():
            for image_path in sorted(images_dir.glob("*")):
                if image_path.is_file():
                    images.append(self._create_image_file(image_path))
        else:
            self.stdout.write(
                self.style.WARNING(
                    f"Sample images directory not found at {images_dir}. Places will seed without new images."
                )
            )

        # Fallback document sample from tests fixtures
        files_dir = self.sample_files_dir
        if files_dir.exists():
            document_path = files_dir / "sample.pdf"
            if document_path.exists():
                documents.append(self._create_document_file(document_path))
        else:
            self.stdout.write(
                self.style.WARNING(
                    f"Sample files directory not found at {files_dir}. Places will seed without document files."
                )
            )

        return images, documents

    def _create_image_file(self, path: Path) -> ImageFile:
        with path.open("rb") as source:
            instance = ImageFile.objects.create(
                file=File(source, name=path.name),
                original_name=path.name,
                mime_type=mimetypes.guess_type(path.name)[0] or "image/png",
                size_bytes=path.stat().st_size,
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded ImageFile from {path}"))
        return instance

    def _create_document_file(self, path: Path) -> DocumentFile:
        with path.open("rb") as source:
            instance = DocumentFile.objects.create(
                file=File(source, name=path.name),
                original_name=path.name,
                mime_type=mimetypes.guess_type(path.name)[0] or "application/pdf",
                size_bytes=path.stat().st_size,
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded DocumentFile from {path}"))
        return instance
