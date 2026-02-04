"""
Seed example news with demo data and media files.

Usage: python manage.py seed_news
"""

from __future__ import annotations

import json
import mimetypes
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from media_files.models import ImageFile
from news.models import News
from core.models import Category


class Command(BaseCommand):
    help = "Seed news with multilingual content and images."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding sample news."))
        with transaction.atomic():
            self._clear_news()
            images = self._ensure_media_files()
            self._create_news(images)

    def _clear_news(self) -> None:
        count = News.objects.count()
        News.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Removed {count} existing news entries."))

    def _create_news(self, images: dict[str, ImageFile]) -> None:
        news_data = self._load_seed_news()

        for index, data in enumerate(news_data):
            image_filename = data.get("image_filename")
            featured_media = images.get(image_filename) if image_filename else None

            # Get category by slug
            category_slug = data.get("category_slug")
            category = None
            if category_slug:
                category = Category.objects.filter(slug=category_slug).first()

            news = News.objects.create(
                slug=f"noticia-{index}",
                is_published=data.get("is_published", True),
                featured_media=featured_media,
                category=category,
            )

            # Apply base fields and translations
            # Default to Catalan for base fields as in the original script
            news.set_current_language("ca")
            news.title = data["title"]
            news.summary = data.get("summary", "")
            news.body = data.get("body", "")

            translations = data.get("translations", {})
            for lang, values in translations.items():
                news.set_current_language(lang)
                news.title = values.get("title", news.title)
                news.summary = values.get("summary", news.summary)
                news.body = values.get("body", news.body)

            news.save()
            # Slug is regenerated in save() if not unique or empty,
            # but we set it manually above for control.

            self.stdout.write(self.style.SUCCESS(f"Created news: {news.title}"))

    def _load_seed_news(self) -> list[dict]:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "news.json"
        try:
            return json.loads(seed_path.read_text(encoding="utf-8"))
        except Exception as e:
            raise CommandError(f"Error loading news seed from {seed_path}: {e}")

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
