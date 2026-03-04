"""
Seed header menu items from a JSON definition file.

Idempotent: deletes existing header items and recreates from seed data.
Supports nested children up to 3 levels (model constraint).
"""

from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from site_settings.models import MenuItem, SiteSettings


class Command(BaseCommand):
    help = "Seed header menu items from JSON definition (idempotent)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print items that would be created and exit.",
        )
        parser.add_argument(
            "--location",
            type=str,
            default="header",
            choices=["header", "footer"],
            help="Menu location to seed (default: header).",
        )

    def handle(self, *args, **options):
        dry_run: bool = options["dry_run"]
        location: str = options["location"]
        items_data = self._load_seed_data()

        if dry_run:
            self._print_tree(items_data)
            return

        settings_obj = SiteSettings.get_solo()

        with transaction.atomic():
            existing = MenuItem.objects.filter(
                settings=settings_obj, location=location
            )
            deleted = self._delete_recursive(existing)
            if deleted:
                self.stdout.write(
                    self.style.WARNING(f"Deleted {deleted} existing {location} items.")
                )

            created = self._create_items(
                items_data, settings_obj, location, parent=None
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {created} menu items for location='{location}'."
            )
        )

    def _delete_recursive(self, queryset) -> int:
        """Delete items children-first to respect PROTECT on parent FK."""
        count = 0
        for item in queryset.filter(parent__isnull=True):
            count += self._delete_item(item)
        return count

    def _delete_item(self, item: MenuItem) -> int:
        """Recursively delete an item and its children (children first)."""
        count = 0
        for child in MenuItem.objects.filter(parent=item):
            count += self._delete_item(child)
        item.delete()
        return count + 1

    def _create_items(
        self,
        items: list[dict],
        settings: SiteSettings,
        location: str,
        parent: MenuItem | None,
    ) -> int:
        count = 0
        for entry in items:
            item = MenuItem.objects.create(
                settings=settings,
                location=location,
                parent=parent,
                order=entry.get("order", 0),
                type=entry.get("type", "custom"),
                label=entry.get("label", ""),
                url=entry.get("url", ""),
            )
            count += 1
            self.stdout.write(f"  {'  ' * (1 if parent else 0)}+ {item}")

            children = entry.get("children", [])
            if children:
                count += self._create_items(children, settings, location, parent=item)
        return count

    def _load_seed_data(self) -> list[dict]:
        seed_path = (
            Path(__file__).resolve().parents[2] / "seed" / "menu_items.json"
        )
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, list):
            raise CommandError(f"Expected a JSON array in {seed_path}")
        return data

    def _print_tree(self, items: list[dict], depth: int = 0) -> None:
        for entry in items:
            indent = "  " * depth
            label = entry.get("label") or entry.get("url") or "?"
            item_type = entry.get("type", "custom")
            self.stdout.write(f"{indent}[{item_type}] {label} (order={entry.get('order', 0)})")
            children = entry.get("children", [])
            if children:
                self._print_tree(children, depth + 1)
