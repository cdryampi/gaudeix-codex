from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from site_settings.models import FooterSettings, SiteSettings


class Command(BaseCommand):
    help = "Seed default footer singleton settings."

    def handle(self, *args, **options):
        seed_data = self._load_seed_data()
        site_settings = SiteSettings.get_solo()
        footer_settings, created = FooterSettings.objects.get_or_create(
            site_settings=site_settings
        )

        if created:
            for field, value in seed_data.items():
                setattr(footer_settings, field, value)
        else:
            for field, value in seed_data.items():
                current = getattr(footer_settings, field)
                if current in ("", None):
                    setattr(footer_settings, field, value)

        footer_settings.save()
        self.stdout.write(self.style.SUCCESS("Footer settings seeded/updated"))

    def _load_seed_data(self) -> dict:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "footer_settings.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, dict):
            raise CommandError(f"Expected a JSON object in {seed_path}")
        return data
