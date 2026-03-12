from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.seed_media import ensure_image_file
from site_settings.models import FooterBadge, FooterSettings


class Command(BaseCommand):
    help = "Seed footer badges from JSON definition."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print badges that would be created and exit.",
        )

    def handle(self, *args, **options):
        items_data = self._load_seed_data()
        if options["dry_run"]:
            for entry in items_data:
                image_file = entry.get("image_file", "")
                suffix = f" [{image_file}]" if image_file else ""
                self.stdout.write(f"{entry.get('title', 'Badge')}{suffix}")
            return

        footer_settings = FooterSettings.for_site_settings()

        with transaction.atomic():
            deleted_count, _ = footer_settings.badges.all().delete()
            if deleted_count:
                self.stdout.write(
                    self.style.WARNING(
                        f"Deleted {deleted_count} existing footer badges."
                    )
                )

            created_count = 0
            for entry in items_data:
                FooterBadge.objects.create(
                    footer_settings=footer_settings,
                    title=entry["title"],
                    alt_text=entry.get("alt_text", ""),
                    url=entry.get("url", ""),
                    order=entry.get("order", 0),
                    is_active=entry.get("is_active", False),
                    image=self._resolve_image(entry),
                )
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Seeded {created_count} footer badges.")
        )

    def _load_seed_data(self) -> list[dict]:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "footer_badges.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, list):
            raise CommandError(f"Expected a JSON array in {seed_path}")
        return data

    def _resolve_image(self, entry: dict):
        image_file = entry.get("image_file")
        if not image_file:
            return None

        image_path = self._badges_root() / image_file
        if not image_path.exists():
            raise CommandError(f"Badge asset not found: {image_path}")

        return ensure_image_file(image_path).instance

    def _badges_root(self) -> Path:
        return Path(__file__).resolve().parents[2] / "seed" / "badges"
