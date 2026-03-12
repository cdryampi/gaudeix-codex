"""
Seed example routes with translations, media files, and technical data.

Usage: python manage.py seed_routes [--dry-run]
"""

from __future__ import annotations

import json
from decimal import Decimal
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Category
from core.seed_media import ensure_media_from_manifest
from core.seed_manifest import load_seed_asset_manifest, render_dry_run
from media_files.models import ImageFile
from routes.models import Route, RouteCheckpoint, RouteCategorySingleton


class Command(BaseCommand):
    help = (
        "Seed sample routes with multilingual content and images. "
        "Run `seed_routes_category` first."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print resolved asset attachments and exit without writing data.",
        )

    def handle(self, *args, **options):
        manifest_entries = self._load_asset_manifest()
        if options.get("dry_run"):
            self.stdout.write(render_dry_run(manifest_entries, title="routes asset manifest"))
            return

        self.stdout.write(self.style.WARNING("Seeding sample routes."))
        with transaction.atomic():
            root_category = self._ensure_root_category()
            self._clear_routes()
            images = self._ensure_media_files(manifest_entries)
            self._create_routes(root_category, images)

    def _load_asset_manifest(self):
        return load_seed_asset_manifest(
            manifest_path=Path(__file__).resolve().parents[2] / "seed" / "routes_assets.yaml",
            assets_root=Path(__file__).resolve().parent,
            allowed_types={"image"},
            allowed_attach_to={"featured_media", "gallery", "checkpoint_image"},
        )

    def _ensure_root_category(self) -> Category:
        try:
            singleton = RouteCategorySingleton.objects.get(pk=1)
            return singleton.category
        except RouteCategorySingleton.DoesNotExist:
            category, _ = Category.objects.get_or_create(
                slug="routes",
                defaults={"nombre": "Routes", "taxonomy": "routes"},
            )
            RouteCategorySingleton.objects.create(pk=1, category=category)
            self.stdout.write(
                self.style.WARNING(
                    "Routes category singleton not found, created minimal version. "
                    "Run seed_routes_category for full setup."
                )
            )
            return category

    def _clear_routes(self) -> None:
        count = Route.objects.count()
        Route.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Removed {count} existing routes."))

    def _create_routes(self, root_category: Category, images: dict[str, ImageFile]) -> None:
        routes_data = self._load_seed_routes()

        for data in routes_data:
            slug = data.get("slug")
            featured_media = images.get(f"featured_media:{slug}")

            route = Route.objects.create(
                slug=slug,
                title=data["title"],
                summary=data.get("summary", ""),
                description=data.get("description", ""),
                instructions=data.get("instructions", ""),
                category=root_category,
                route_type=data.get("route_type", "walking"),
                difficulty=data.get("difficulty", "moderate"),
                distance_km=Decimal(str(data["distance_km"])) if data.get("distance_km") else None,
                duration_minutes=data.get("duration_minutes"),
                elevation_gain=data.get("elevation_gain"),
                elevation_loss=data.get("elevation_loss"),
                start_latitude=Decimal(str(data["start_latitude"])) if data.get("start_latitude") else None,
                start_longitude=Decimal(str(data["start_longitude"])) if data.get("start_longitude") else None,
                end_latitude=Decimal(str(data["end_latitude"])) if data.get("end_latitude") else None,
                end_longitude=Decimal(str(data["end_longitude"])) if data.get("end_longitude") else None,
                is_circular=data.get("is_circular", False),
                is_published=data.get("is_published", True),
                is_featured=data.get("is_featured", False),
                featured_media=featured_media,
            )

            self._apply_translations(route, data.get("translations", {}))
            self._create_checkpoints(route, data.get("checkpoints", []), images)

            tag_slugs = data.get("tags", [])
            for tag_slug in tag_slugs:
                try:
                    from core.models import Tag

                    tag = Tag.objects.get(slug=tag_slug)
                    route.tags.add(tag)
                except Tag.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"    Warning: Tag '{tag_slug}' not found for route '{route}'"))

            gallery_filenames = data.get("gallery", [])
            if gallery_filenames:
                gallery_imgs = [
                    images.get(f"gallery:{name}")
                    for name in gallery_filenames
                    if images.get(f"gallery:{name}")
                ]
                if gallery_imgs:
                    route.gallery.add(*gallery_imgs)
                    self.stdout.write(self.style.SUCCESS(f"  → Added {len(gallery_imgs)} gallery images for '{route}'"))

            self.stdout.write(self.style.SUCCESS(f"Created route '{route}'"))

    def _load_seed_routes(self) -> list[dict]:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "routes.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, list):
            raise CommandError(f"Expected a JSON array in {seed_path}")
        return data

    def _apply_translations(self, route: Route, translations: dict) -> None:
        for language_code, values in translations.items():
            if not isinstance(values, dict):
                continue
            route.set_current_language(language_code)
            if "title" in values:
                route.title = values["title"]
            if "summary" in values:
                route.summary = values["summary"]
            if "description" in values:
                route.description = values["description"]
            if "instructions" in values:
                route.instructions = values["instructions"]
            route.save()

    def _create_checkpoints(self, route: Route, checkpoints: list[dict], images: dict[str, ImageFile]) -> None:
        for cp_data in checkpoints:
            image_filename = cp_data.get("image")
            checkpoint_image = images.get(f"checkpoint_image:{image_filename}") if image_filename else None

            RouteCheckpoint.objects.create(
                route=route,
                order=cp_data["order"],
                title=cp_data["title"],
                description=cp_data.get("description", ""),
                image=checkpoint_image,
                latitude=Decimal(str(cp_data["latitude"])) if cp_data.get("latitude") else None,
                longitude=Decimal(str(cp_data["longitude"])) if cp_data.get("longitude") else None,
                is_active=True,
            )
        if checkpoints:
            self.stdout.write(self.style.SUCCESS(f"  → Created {len(checkpoints)} checkpoints for '{route}'"))

    def _ensure_media_files(self, manifest_entries) -> dict[str, ImageFile]:
        media_index = ensure_media_from_manifest(manifest_entries)
        image_map: dict[str, ImageFile] = {}
        for entry in manifest_entries:
            key = f"{entry.attach_to}:{entry.slug_or_key}"
            image_map[key] = media_index.images[(entry.attach_to, entry.slug_or_key)]
        return image_map
