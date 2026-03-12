"""
Management command to seed example events with translations, categories, tags and media.

Usage: python manage.py seed_events [--day-offset N] [--dry-run]
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from core.models import Category, Tag
from core.seed_media import ensure_media_from_manifest
from core.seed_assets import SEED_ASSETS_ROOT
from core.seed_manifest import load_seed_asset_manifest, render_dry_run
from events.models import Event, EventCategorySingleton, EventDate
from media_files.models import DocumentFile, ImageFile


class Command(BaseCommand):
    help = (
        "Seed sample events with multilingual title/summary/description, categories, tags and media. "
        "Run `seed_events_category` and `seed_tags` first for best results."
    )

    def add_arguments(self, parser):
        parser.add_argument("--day-offset", type=int, default=0, help="Number of days to shift the base 'now' for offsets.")
        parser.add_argument("--dry-run", action="store_true", help="Print resolved asset attachments and exit.")

    def handle(self, *args, **options):
        manifest_entries = self._load_asset_manifest()
        if options.get("dry_run"):
            self.stdout.write(render_dry_run(manifest_entries, title="events asset manifest"))
            return

        self.stdout.write(self.style.WARNING("Seeding sample events. Verify media, categories and tags before use."))
        with transaction.atomic():
            root_category = self._ensure_root_category()
            self._clear_events()
            images, documents = self._ensure_media_files(manifest_entries)
            self._create_events(root_category, images, documents, **options)

    def _load_asset_manifest(self):
        return load_seed_asset_manifest(
            manifest_path=Path(__file__).resolve().parents[2] / "seed" / "events_assets.yaml",
            assets_root=SEED_ASSETS_ROOT / "events",
            allowed_types={"image", "document"},
            allowed_attach_to={"featured_media", "attachment"},
        )

    def _ensure_root_category(self) -> Category:
        category, _ = Category.objects.get_or_create(slug="events", defaults={"nombre": "Events", "taxonomy": "events"})
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

    def _create_events(self, root_category: Category, images: dict[str, ImageFile], documents: dict[str, DocumentFile], **options) -> None:
        payload = self._load_seed_events_payload()
        events_data = payload["events"]
        tzinfo = self._resolve_tz(payload.get("timezone"))

        day_offset = options.get("day_offset", 0)
        base_now = timezone.now() + timedelta(days=day_offset)

        for index, data in enumerate(events_data):
            slug = data.get("slug") or None
            category_slug = data.get("category_slug") or None
            category = self._resolve_category(root_category, category_slug)

            featured_media = images.get(slug or "") or self._pick_media(list(images.values()), index)

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

            start_at = self._resolve_datetime(data.get("start_at"), base_now, data.get("start_offset"), tzinfo)
            end_at = self._resolve_datetime(data.get("end_at"), base_now, data.get("end_offset"), tzinfo)
            if start_at:
                EventDate.objects.create(event=event, start_at=start_at, end_at=end_at)
                event.update_cached_dates()

            for date_info in data.get("extra_dates", []):
                extra_start = self._resolve_datetime(date_info.get("start_at"), base_now, date_info.get("start_offset"), tzinfo)
                extra_end = self._resolve_datetime(date_info.get("end_at"), base_now, date_info.get("end_offset"), tzinfo)
                if extra_start:
                    EventDate.objects.create(event=event, start_at=extra_start, end_at=extra_end)
            event.update_cached_dates()

            attachments = data.get("attachment_filenames") or data.get("attachments") or []
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
            resolved.append(Tag.objects.create(slug=slug, nombre=slug.replace("-", " ").title()))
        return resolved

    def _resolve_attachments(self, attachments: list[str], documents_by_key: dict[str, DocumentFile]) -> list[DocumentFile]:
        documents = list(DocumentFile.objects.filter(original_name__in=attachments))
        by_name = {d.original_name: d for d in documents}
        resolved: list[DocumentFile] = []
        manifest_fallback = list(documents_by_key.values())
        for name in attachments:
            if name in by_name:
                resolved.append(by_name[name])
                continue
            from_manifest = documents_by_key.get(name)
            if from_manifest:
                resolved.append(from_manifest)
                continue
            if manifest_fallback:
                resolved.append(manifest_fallback[len(resolved) % len(manifest_fallback)])
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
        return {"timezone": data.get("timezone"), "events": events}

    def _resolve_tz(self, tz_name: str | None):
        if tz_name:
            try:
                return ZoneInfo(tz_name)
            except Exception:
                pass
        return timezone.get_current_timezone()

    def _resolve_datetime(self, value, base_now, offset: dict | None, tzinfo):
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
        category = Category.objects.create(slug=slug, nombre=slug.replace("-", " ").title(), taxonomy=root_category.taxonomy, parent=root_category)
        self.stdout.write(self.style.WARNING(f"Category '{slug}' not found, created under '{root_category.slug}'"))
        return category

    def _ensure_media_files(self, manifest_entries) -> tuple[dict[str, ImageFile], dict[str, DocumentFile]]:
        images_by_slug: dict[str, ImageFile] = {}
        docs_by_key: dict[str, DocumentFile] = {}
        media_index = ensure_media_from_manifest(manifest_entries)

        for entry in manifest_entries:
            if entry.type == "image" and entry.attach_to == "featured_media":
                images_by_slug[entry.slug_or_key] = media_index.images[(entry.attach_to, entry.slug_or_key)]
            elif entry.type == "document" and entry.attach_to == "attachment":
                docs_by_key[entry.slug_or_key] = media_index.documents[(entry.attach_to, entry.slug_or_key)]

        return images_by_slug, docs_by_key
