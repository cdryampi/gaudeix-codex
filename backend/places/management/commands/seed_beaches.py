from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Category
from core.seed_media import ensure_media_from_manifest
from core.seed_manifest import load_seed_asset_manifest, render_dry_run
from media_files.models import ImageFile
from places.models import Beach


class Command(BaseCommand):
    help = "Seed beach records and attach featured media from backend/seed_assets/places/images."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print resolved beach asset attachments and exit.",
        )

    def handle(self, *args, **options):
        manifest_entries = self._load_asset_manifest()
        if options.get("dry_run"):
            self.stdout.write(
                render_dry_run(manifest_entries, title="beaches asset manifest")
            )
            return

        self.stdout.write(
            self.style.WARNING("Seeding beaches. Existing Beach rows will be replaced.")
        )
        with transaction.atomic():
            self._ensure_beaches_category()
            image_map = self._ensure_media_files(manifest_entries)
            self._clear_beaches()
            self._create_beaches(image_map)

    def _load_asset_manifest(self):
        return load_seed_asset_manifest(
            manifest_path=Path(__file__).resolve().parents[2] / "seed" / "beaches_assets.yaml",
            assets_root=Path(__file__).resolve().parents[3] / "seed_assets" / "places",
            allowed_types={"image"},
            allowed_attach_to={"featured_media", "gallery"},
        )

    def _ensure_beaches_category(self) -> Category:
        category, _ = Category.objects.get_or_create(
            slug="beaches",
            defaults={"nombre": "Playas", "taxonomy": "template"},
        )
        if category.taxonomy != "template":
            category.taxonomy = "template"
            category.save(update_fields=["taxonomy"])
        return category

    def _ensure_media_files(self, manifest_entries) -> dict[str, ImageFile]:
        media_index = ensure_media_from_manifest(manifest_entries)
        return {
            entry.slug_or_key: media_index.images[(entry.attach_to, entry.slug_or_key)]
            for entry in manifest_entries
        }

    def _clear_beaches(self) -> None:
        count = Beach.objects.count()
        Beach.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Removed {count} existing beaches."))

    def _create_beaches(self, image_map: dict[str, ImageFile]) -> None:
        beaches_data = self._load_seed_beaches()
        for data in beaches_data:
            image_key = data.get("image_filename")
            featured_media = image_map.get(image_key or "")
            if featured_media is None:
                raise CommandError(
                    f"Beach '{data.get('title')}' references unknown image '{image_key}'."
                )

            beach = Beach.objects.create(
                title=data["title"],
                description=data.get("description", ""),
                location_text=data.get("location_text", ""),
                latitude=data.get("latitude"),
                longitude=data.get("longitude"),
                featured_media=featured_media,
                beach_type=data.get("beach_type", "urban"),
                environment_summary=data.get("environment_summary", ""),
                recommended_for=data.get("recommended_for", []),
                length_m=data.get("length_m"),
                access_notes=data.get("access_notes", ""),
                parking_info=data.get("parking_info", ""),
                public_transport_info=data.get("public_transport_info", ""),
                services=data.get("services", {}),
                accessibility_features=data.get("accessibility_features", {}),
            )
            beach.gallery.add(featured_media)
            
            for gallery_key in data.get("gallery_filenames", []):
                gallery_img = image_map.get(gallery_key)
                if gallery_img:
                    beach.gallery.add(gallery_img)

            self._apply_translations(beach, data.get("translations", {}))
            self.stdout.write(self.style.SUCCESS(f"Created beach '{beach}'"))

    def _load_seed_beaches(self) -> list[dict]:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "beaches.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, list):
            raise CommandError(f"Expected a JSON array in {seed_path}")
        return data

    def _apply_translations(self, beach: Beach, translations: dict) -> None:
        for language_code, values in translations.items():
            beach.set_current_language(language_code)
            beach.title = values.get("title", beach.title)
            beach.description = values.get("description", beach.description)
            beach.save()
