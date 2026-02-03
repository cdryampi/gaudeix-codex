"""
Seed example festes with translations, sponsors, and media files.

Usage: python manage.py seed_festes
"""

from __future__ import annotations

import json
import mimetypes
from datetime import date
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Category
from festes.models import Festa, FestaCategorySingleton, Sponsor
from media_files.models import ImageFile


class Command(BaseCommand):
    help = (
        "Seed sample festes with multilingual content, sponsors and images. "
        "Run `seed_festes_category` first."
    )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding sample festes."))
        with transaction.atomic():
            root_category = self._ensure_root_category()
            self._clear_festes()
            images = self._ensure_media_files()
            self._create_festes(root_category, images)

    def _ensure_root_category(self) -> Category:
        try:
            singleton = FestaCategorySingleton.objects.get(pk=1)
            return singleton.category
        except FestaCategorySingleton.DoesNotExist:
            # Create minimal category if not exists
            category, _ = Category.objects.get_or_create(
                slug="festes",
                defaults={"nombre": "Festes", "taxonomy": "festes"},
            )
            FestaCategorySingleton.objects.create(pk=1, category=category)
            self.stdout.write(
                self.style.WARNING(
                    "Festes category singleton not found, created minimal version. "
                    "Run seed_festes_category for full setup."
                )
            )
            return category

    def _clear_festes(self) -> None:
        # Sponsors are deleted via cascade
        count = Festa.objects.count()
        Festa.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Removed {count} existing festes."))

    def _create_festes(self, root_category: Category, images: dict[str, ImageFile]) -> None:
        festes_data = self._load_seed_festes()

        for data in festes_data:
            slug = data.get("slug")

            # Parse dates
            start_date = self._parse_date(data["start_date"])
            end_date = self._parse_date(data["end_date"])

            # Handle is_current constraint - only one can be true
            is_current = data.get("is_current", False)
            if is_current:
                # Clear any existing current festa
                Festa.objects.filter(is_current=True).update(is_current=False)

            # Find matching image by slug
            featured_media = images.get(f"{slug}.png")

            festa = Festa.objects.create(
                slug=slug,
                title=data["title"],
                subtitle=data.get("subtitle", ""),
                summary=data.get("summary", ""),
                description=data.get("description", ""),
                program_text=data.get("program_text", ""),
                start_date=start_date,
                end_date=end_date,
                year=data["year"],
                category=root_category,
                is_published=data.get("is_published", True),
                is_featured=data.get("is_featured", False),
                is_current=is_current,
                featured_media=featured_media,
                poster=featured_media,  # Also use as poster for seed
            )

            # Create sponsors
            for sponsor_data in data.get("sponsors", []):
                Sponsor.objects.create(
                    festa=festa,
                    name=sponsor_data["name"],
                    tier=sponsor_data.get("tier", "collaborator"),
                    website=sponsor_data.get("website", ""),
                    order=sponsor_data.get("order", 0),
                )

            self._apply_translations(festa, data.get("translations", {}))
            self.stdout.write(self.style.SUCCESS(f"Created festa '{festa}'"))

    def _parse_date(self, date_str: str) -> date:
        """Parse ISO date string to date object."""
        return date.fromisoformat(date_str)

    def _load_seed_festes(self) -> list[dict]:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "festes.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, list):
            raise CommandError(f"Expected a JSON array in {seed_path}")
        return data

    def _apply_translations(self, festa: Festa, translations: dict) -> None:
        for language_code, values in translations.items():
            if not isinstance(values, dict):
                continue
            festa.set_current_language(language_code)
            if "title" in values:
                festa.title = values["title"]
            if "subtitle" in values:
                festa.subtitle = values["subtitle"]
            if "summary" in values:
                festa.summary = values["summary"]
            if "description" in values:
                festa.description = values["description"]
            if "program_text" in values:
                festa.program_text = values["program_text"]
            festa.save()

    @property
    def sample_images_dir(self) -> Path:
        return Path(__file__).resolve().parent / "images"

    def _ensure_media_files(self) -> dict[str, ImageFile]:
        image_map = {}
        images_dir = self.sample_images_dir
        if images_dir.exists():
            for image_path in images_dir.glob("*.png"):
                if image_path.is_file():
                    image_map[image_path.name] = self._create_image_file(image_path)
        return image_map

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

