"""
Seed common tags with translations.

Idempotent: safe to run multiple times.
"""

from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Tag


class Command(BaseCommand):
    help = "Seed common tags with translations"

    def handle(self, *args, **options):
        seed_tags = self._load_seed_tags()
        with transaction.atomic():
            created = 0
            updated = 0
            for entry in seed_tags:
                slug = entry["slug"]
                names = entry.get("translations", {}) or {}
                tag, was_created = Tag.objects.get_or_create(
                    slug=slug,
                    defaults={"nombre": names.get("en") or slug},
                )

                changed = False
                for lang_code, name in names.items():
                    tag.set_current_language(lang_code)
                    if tag.nombre != name:
                        tag.nombre = name
                        changed = True

                if changed:
                    tag.save()
                    if not was_created:
                        updated += 1

                if was_created:
                    created += 1

            total = Tag.objects.count()
            self.stdout.write(
                self.style.SUCCESS(
                    f"Seeded tags: created={created}, updated={updated}, total={total}"
                )
            )

    def _load_seed_tags(self) -> list[dict]:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "tags.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, list):
            raise CommandError(f"Expected a JSON array in {seed_path}")

        return data
