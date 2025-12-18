"""
Management command to seed example events with translations, categories, tags and media.

Usage: python manage.py seed_events
"""

from __future__ import annotations

import json
import mimetypes
from datetime import timedelta
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from core.models import Category, Tag
from events.models import Event, EventCategorySingleton
from media_files.models import DocumentFile, ImageFile


class Command(BaseCommand):
    help = (
        "Seed sample events with multilingual title/summary/description, categories, tags and media. "
        "Run `seed_events_category` and `seed_tags` first for best results."
    )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding sample events. Verify media, categories and tags before use."))
        with transaction.atomic():
            root_category = self._ensure_root_category()
            self._clear_events()
            images, documents = self._ensure_media_files()
            self._create_events(root_category, images, documents)

    def _ensure_root_category(self) -> Category:
        category, _ = Category.objects.get_or_create(
            slug="events",
            defaults={"nombre": "Events", "taxonomy": "events"},
        )
        if category.taxonomy != "events":
            category.taxonomy = "events"
            category.save(update_fields=["taxonomy"])

        singleton, _ = EventCategorySingleton.objects.get_or_create(pk=1, defaults={"category": category})
        if singleton.category != category:
            singleton.category = category
            singleton.save(update_fields=["category"])
        return category

    def _clear_events(self) -> None:
        count = Event.objects.count()
        Event.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Removed {count} existing events."))

    def _create_events(self, root_category: Category, images: list[ImageFile], documents: list[DocumentFile]) -> None:
        images = images or []
        documents = documents or []
        events_data = self._load_seed_events()
        base_now = timezone.now()

        for index, data in enumerate(events_data):
            start_at = data.get("start_at") or self._datetime_from_offset(
                base_now, data.get("start_offset")
            )
            end_at = data.get("end_at")
            if end_at is None:
                end_offset = data.get("end_offset")
                end_at = self._datetime_from_offset(base_now, end_offset) if end_offset else None

            category = Category.objects.filter(slug=data.get("category_slug")).first() or root_category
            event = Event.objects.create(
                title=data["title"],
                summary=data.get("summary", ""),
                description=data.get("description", ""),
                start_at=start_at,
                end_at=end_at,
                is_published=data.get("is_published", True),
                venue_name=data.get("venue_name", ""),
                location_text=data.get("location_text", ""),
                is_featured=data.get("is_featured", False),
                is_free=data.get("is_free", True),
                price_text=data.get("price_text", ""),
                category=category,
                featured_media=self._pick_media(images, index),
            )

            if documents:
                event.attachments.add(documents[index % len(documents)])

            tag_slugs = data.get("tag_slugs", []) or []
            if tag_slugs:
                event.tags.set(self._resolve_tags(tag_slugs))

            self._apply_translations(event, data.get("translations", {}))
            self.stdout.write(self.style.SUCCESS(f"Created event '{event}'"))

    def _resolve_tags(self, slugs: list[str]) -> list[Tag]:
        tags = list(Tag.objects.filter(slug__in=slugs))
        by_slug = {t.slug: t for t in tags}
        resolved: list[Tag] = []
        for slug in slugs:
            if slug in by_slug:
                resolved.append(by_slug[slug])
                continue
            resolved.append(Tag.objects.create(slug=slug, nombre=slug.replace("-", " ").title()))
        return resolved

    def _apply_translations(self, event: Event, translations: dict) -> None:
        for language_code, values in translations.items():
            event.set_current_language(language_code)
            event.title = values.get("title", event.title)
            event.summary = values.get("summary", event.summary)
            event.description = values.get("description", event.description)
            event.save()

    def _pick_media(self, images: list[ImageFile], index: int):
        if not images:
            return None
        return images[index % len(images)]

    def _datetime_from_offset(self, base, offset: dict | None):
        if not offset or not isinstance(offset, dict):
            return base
        days = offset.get("days", 0) or 0
        hours = offset.get("hours", 0) or 0
        return base + timedelta(days=days, hours=hours)

    def _load_seed_events(self) -> list[dict]:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "events.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, list):
            raise CommandError(f"Expected a JSON array in {seed_path}")
        return data

    def _ensure_media_files(self) -> tuple[list[ImageFile], list[DocumentFile]]:
        """
        Ensure at least one ImageFile and DocumentFile exist using local sample files.
        """
        images = list(ImageFile.objects.all())
        documents = list(DocumentFile.objects.all())

        sample_dir = self.sample_files_dir
        if not sample_dir.exists():
            self.stdout.write(
                self.style.WARNING(
                    f"Sample media directory not found at {sample_dir}. Events will seed without new media."
                )
            )
            return images, documents

        if not images:
            image_path = sample_dir / "sample.png"
            if image_path.exists():
                images.append(self._create_image_file(image_path))

        if not documents:
            document_path = sample_dir / "sample.pdf"
            if document_path.exists():
                documents.append(self._create_document_file(document_path))

        return images, documents

    @property
    def sample_files_dir(self) -> Path:
        return Path(__file__).resolve().parents[2] / "tests" / "files"

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
