"""
Management command to seed example events with translations, categories, tags and media.

Usage: python manage.py seed_events
"""

from __future__ import annotations

import json
import mimetypes
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.dateparse import parse_datetime
from django.utils import timezone

from core.models import Category, Tag
from events.models import Event, EventCategorySingleton, EventDate
from core.seed_utils import list_files_sorted
from media_files.models import DocumentFile, ImageFile


class Command(BaseCommand):
    help = (
        "Seed sample events with multilingual title/summary/description, categories, tags and media. "
        "Run `seed_events_category` and `seed_tags` first for best results."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--day-offset",
            type=int,
            default=0,
            help="Number of days to shift the base 'now' for offsets.",
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.WARNING(
                "Seeding sample events. Verify media, categories and tags before use."
            )
        )
        with transaction.atomic():
            root_category = self._ensure_root_category()
            self._clear_events()
            images, documents = self._ensure_media_files()
            self._create_events(root_category, images, documents, **options)

    def _ensure_root_category(self) -> Category:
        category, _ = Category.objects.get_or_create(
            slug="events",
            defaults={"nombre": "Events", "taxonomy": "events"},
        )
        if category.taxonomy != "events":
            category.taxonomy = "events"
            category.save(update_fields=["taxonomy"])

        singleton, _ = EventCategorySingleton.objects.get_or_create(
            pk=1, defaults={"category": category}
        )
        if singleton.category != category:
            singleton.category = category
            singleton.save(update_fields=["category"])
        return category

    def _clear_events(self) -> None:
        count = Event.objects.count()
        Event.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Removed {count} existing events."))

    def _create_events(
        self,
        root_category: Category,
        images: list[ImageFile],
        documents: list[DocumentFile],
        **options,
    ) -> None:
        images = images or []
        documents = documents or []
        payload = self._load_seed_events_payload()
        events_data = payload["events"]
        tzinfo = self._resolve_tz(payload.get("timezone"))
        media_dir = self._resolve_media_dir(payload.get("media_base_dir"))
        
        day_offset = options.get("day_offset", 0)
        base_now = timezone.now() + timedelta(days=day_offset)

        for index, data in enumerate(events_data):
            slug = data.get("slug") or None
            category_slug = data.get("category_slug") or None
            category = self._resolve_category(root_category, category_slug)

            featured_media = self._resolve_featured_media(
                media_dir,
                data.get("featured_image_filename"),
            ) or self._pick_media(images, index)

            create_kwargs = {
                "is_published": data.get("is_published", True),
                "venue_name": data.get("venue_name", ""),
                "location_text": data.get("location_text", ""),
                "is_featured": data.get("is_featured", False),
                "is_free": data.get("is_free", True),
                "price_text": data.get("price_text", ""),
                "points_value": data.get("points_value", 20),
                "category": category,
                "featured_media": featured_media,
            }
            if "price" in data:
                create_kwargs["price"] = data["price"]
            if slug:
                create_kwargs["slug"] = slug

            if "title" in data:
                create_kwargs["title"] = data["title"]
            if "summary" in data:
                create_kwargs["summary"] = data.get("summary", "")
            if "description" in data:
                create_kwargs["description"] = data.get("description", "")

            event = Event.objects.create(**create_kwargs)

            # Create dates
            start_at = self._resolve_datetime(
                data.get("start_at"), base_now, data.get("start_offset"), tzinfo
            )
            end_at = self._resolve_datetime(
                data.get("end_at"), base_now, data.get("end_offset"), tzinfo
            )

            if start_at:
                EventDate.objects.create(event=event, start_at=start_at, end_at=end_at)
                event.update_cached_dates()

            # Create additional dates if present in payload (custom extension)
            extra_dates = data.get("extra_dates", [])
            for date_info in extra_dates:
                extra_start = self._resolve_datetime(
                    date_info.get("start_at"),
                    base_now,
                    date_info.get("start_offset"),
                    tzinfo,
                )
                extra_end = self._resolve_datetime(
                    date_info.get("end_at"),
                    base_now,
                    date_info.get("end_offset"),
                    tzinfo,
                )
                if extra_start:
                    EventDate.objects.create(
                        event=event, start_at=extra_start, end_at=extra_end
                    )

            event.update_cached_dates()  # Ensure sync

            attachments = (
                data.get("attachment_filenames") or data.get("attachments") or []
            )
            if attachments and isinstance(attachments, list):
                event.attachments.set(self._resolve_attachments(attachments, documents))

            tag_slugs = data.get("tags") or data.get("tag_slugs") or []
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
            resolved.append(
                Tag.objects.create(slug=slug, nombre=slug.replace("-", " ").title())
            )
        return resolved

    def _resolve_attachments(
        self, attachments: list[str], fallback_documents: list[DocumentFile]
    ) -> list[DocumentFile]:
        documents = list(DocumentFile.objects.filter(original_name__in=attachments))
        by_name = {d.original_name: d for d in documents}
        resolved: list[DocumentFile] = []
        for name in attachments:
            if name in by_name:
                resolved.append(by_name[name])
                continue
            if fallback_documents:
                resolved.append(
                    fallback_documents[len(resolved) % len(fallback_documents)]
                )
        return resolved

    def _apply_translations(self, event: Event, translations: dict) -> None:
        for language_code, values in (translations or {}).items():
            if not isinstance(values, dict):
                continue
            event.set_current_language(language_code)
            if "title" in values:
                event.title = values["title"]
            if "summary" in values:
                event.summary = values["summary"]
            if "description" in values:
                event.description = values["description"]
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

    def _load_seed_events_payload(self) -> dict:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "events.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if isinstance(data, list):
            return {"events": data}
        if not isinstance(data, dict):
            raise CommandError(f"Expected a JSON array or object in {seed_path}")

        events = data.get("events")
        if not isinstance(events, list):
            raise CommandError(f"Expected 'events' array in {seed_path}")
        return {
            "timezone": data.get("timezone"),
            "media_base_dir": data.get("media_base_dir"),
            "events": events,
        }

    def _resolve_tz(self, tz_name: str | None):
        if tz_name:
            try:
                return ZoneInfo(tz_name)
            except Exception:
                pass
        return timezone.get_current_timezone()

    def _resolve_media_dir(self, base_dir: str | None) -> Path | None:
        if not base_dir:
            return None
        app_root = Path(__file__).resolve().parents[2]
        return app_root / base_dir

    def _resolve_datetime(
        self,
        value,
        base_now,
        offset: dict | None,
        tzinfo,
    ):
        if isinstance(value, str):
            dt = parse_datetime(value)
            if dt is None:
                raise CommandError(f"Invalid datetime string: {value}")
            if timezone.is_naive(dt):
                dt = dt.replace(tzinfo=tzinfo)
            return dt
        if isinstance(value, datetime):
            return value
        if offset:
            return self._datetime_from_offset(base_now, offset)
        if value is None:
            return None
        raise CommandError(f"Unsupported datetime value: {value!r}")

    def _resolve_category(self, root_category: Category, slug: str | None) -> Category:
        if not slug:
            return root_category
        category = Category.objects.filter(slug=slug).first()
        if category:
            return category
        category = Category.objects.create(
            slug=slug,
            nombre=slug.replace("-", " ").title(),
            taxonomy=root_category.taxonomy,
            parent=root_category,
        )
        self.stdout.write(
            self.style.WARNING(
                f"Category '{slug}' not found, created under '{root_category.slug}'"
            )
        )
        return category

    def _resolve_featured_media(
        self, media_dir: Path | None, filename: str | None
    ) -> ImageFile | None:
        if not filename or not media_dir:
            return None
        if not media_dir.exists():
            self.stdout.write(
                self.style.WARNING(f"Media directory not found: {media_dir}")
            )
            return None

        path = self._find_media_file(media_dir, filename)
        if not path:
            self.stdout.write(
                self.style.WARNING(f"Featured image not found: {filename}")
            )
            return None

        existing = ImageFile.objects.filter(original_name=path.name).first()
        if existing:
            return existing

        with path.open("rb") as source:
            instance = ImageFile.objects.create(
                file=File(source, name=path.name),
                original_name=path.name,
                mime_type=mimetypes.guess_type(path.name)[0] or "image/jpeg",
                size_bytes=path.stat().st_size,
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded ImageFile from {path}"))
        return instance

    def _find_media_file(self, media_dir: Path, filename: str) -> Path | None:
        direct = media_dir / filename
        if direct.is_file():
            return direct

        alt_candidates = {filename.replace(" ", "_"), filename.replace("_", " ")}
        for candidate in alt_candidates:
            candidate_path = media_dir / candidate
            if candidate_path.is_file():
                return candidate_path

        lower = filename.lower()
        for path in list_files_sorted(media_dir):
            if path.name.lower() == lower:
                return path
        return None

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
