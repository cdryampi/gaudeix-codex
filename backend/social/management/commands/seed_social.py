from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from social.models import SocialLink


class Command(BaseCommand):
    help = 'Seeds the database with initial social links.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding social links...')
        links_data = self._load_seed_links()

        created = 0
        updated = 0

        for entry in links_data:
            url = entry["url"]
            icon_class = entry.get("icon_class", "")
            color = entry.get("color", "")
            order = entry.get("order", 0)
            translations = entry.get("translations", {}) or {}

            link, was_created = SocialLink.objects.get_or_create(
                url=url,
                defaults={
                    "icon_class": icon_class,
                    "color": color,
                    "order": order,
                },
            )

            changed = False
            for field, value in (("icon_class", icon_class), ("color", color), ("order", order)):
                if getattr(link, field) != value:
                    setattr(link, field, value)
                    changed = True

            for lang_code, name in translations.items():
                link.set_current_language(lang_code)
                link.name = name
                changed = True

            if changed:
                link.save()

            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f"Created {url}"))
            elif changed:
                updated += 1
                self.stdout.write(self.style.WARNING(f"Updated {url}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded social links. created={created}, updated={updated}"
            )
        )

    def _load_seed_links(self) -> list[dict]:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "social_links.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, list):
            raise CommandError(f"Expected a JSON array in {seed_path}")
        return data
