from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Category
from site_settings.models import FooterLink, FooterSettings, MenuItem
from static_pages.models import StaticPage


class Command(BaseCommand):
    help = "Seed footer links from JSON definition."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print links that would be created and exit.",
        )

    def handle(self, *args, **options):
        items_data = self._load_seed_data()
        if options["dry_run"]:
            for entry in items_data:
                self.stdout.write(
                    f"[{entry.get('section', 'explore')}] {entry.get('type', 'custom')} {entry.get('label', '')}"
                )
            return

        footer_settings = FooterSettings.for_site_settings()

        with transaction.atomic():
            deleted_count, _ = footer_settings.links.all().delete()
            if deleted_count:
                self.stdout.write(
                    self.style.WARNING(f"Deleted {deleted_count} existing footer links.")
                )

            created_count = 0
            for entry in items_data:
                FooterLink.objects.create(
                    footer_settings=footer_settings,
                    section=entry["section"],
                    type=entry["type"],
                    label=entry.get("label", ""),
                    url=entry.get("url", ""),
                    category=self._resolve_category(entry),
                    static_page=self._resolve_static_page(entry),
                    order=entry.get("order", 0),
                    is_active=entry.get("is_active", True),
                )
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Seeded {created_count} footer links.")
        )

    def _resolve_category(self, entry: dict):
        if entry.get("type") != MenuItem.TypeChoices.CATEGORY:
            return None
        slug = entry.get("category_slug")
        if not slug:
            raise CommandError("category_slug is required for category footer links.")
        try:
            return Category.objects.get(slug=slug)
        except Category.DoesNotExist as exc:
            raise CommandError(f"Category not found for slug '{slug}'.") from exc

    def _resolve_static_page(self, entry: dict):
        if entry.get("type") != MenuItem.TypeChoices.STATIC_PAGE:
            return None

        slug = entry.get("static_page_slug")
        template = entry.get("static_page_template")
        try:
            if slug:
                return StaticPage.objects.get(slug=slug)
            if template:
                return StaticPage.objects.get(template=template)
        except StaticPage.DoesNotExist as exc:
            raise CommandError("Static page not found for footer link seed.") from exc
        raise CommandError(
            "static_page_slug or static_page_template is required for static_page footer links."
        )

    def _load_seed_data(self) -> list[dict]:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "footer_links.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, list):
            raise CommandError(f"Expected a JSON array in {seed_path}")
        return data
