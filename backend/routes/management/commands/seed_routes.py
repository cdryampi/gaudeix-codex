"""
Seed example routes with translations, media files, and technical data.

Usage: python manage.py seed_routes
"""

from __future__ import annotations

import json
import mimetypes
from decimal import Decimal
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Category
from core.seed_assets import resolve_seed_asset_dir
from media_files.models import ImageFile
from routes.models import Route, RouteCheckpoint, RouteCategorySingleton


class Command(BaseCommand):
    help = (
        "Seed sample routes with multilingual content and images. "
        "Run `seed_routes_category` first."
    )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding sample routes."))
        with transaction.atomic():
            root_category = self._ensure_root_category()
            self._clear_routes()
            images = self._ensure_media_files()
            self._create_routes(root_category, images)

    def _ensure_root_category(self) -> Category:
        try:
            singleton = RouteCategorySingleton.objects.get(pk=1)
            return singleton.category
        except RouteCategorySingleton.DoesNotExist:
            # Create minimal category if not exists
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

            # Find matching image by slug
            featured_media = images.get(f"{slug}.png")

            route = Route.objects.create(
                slug=slug,
                title=data["title"],
                summary=data.get("summary", ""),
                description=data.get("description", ""),
                instructions=data.get("instructions", ""),
                category=root_category,
                route_type=data.get("route_type", "walking"),
                difficulty=data.get("difficulty", "moderate"),
                distance_km=Decimal(str(data["distance_km"]))
                if data.get("distance_km")
                else None,
                duration_minutes=data.get("duration_minutes"),
                elevation_gain=data.get("elevation_gain"),
                elevation_loss=data.get("elevation_loss"),
                start_latitude=Decimal(str(data["start_latitude"]))
                if data.get("start_latitude")
                else None,
                start_longitude=Decimal(str(data["start_longitude"]))
                if data.get("start_longitude")
                else None,
                end_latitude=Decimal(str(data["end_latitude"]))
                if data.get("end_latitude")
                else None,
                end_longitude=Decimal(str(data["end_longitude"]))
                if data.get("end_longitude")
                else None,
                is_circular=data.get("is_circular", False),
                is_published=data.get("is_published", True),
                is_featured=data.get("is_featured", False),
                featured_media=featured_media,
            )

            self._apply_translations(route, data.get("translations", {}))
            self._create_checkpoints(route, data.get("checkpoints", []), images)

            # Add tags
            tag_slugs = data.get("tags", [])
            for tag_slug in tag_slugs:
                try:
                    from core.models import Tag
                    tag = Tag.objects.get(slug=tag_slug)
                    route.tags.add(tag)
                except Tag.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"    Warning: Tag '{tag_slug}' not found for route '{route}'"))

            # Add gallery images
            gallery_filenames = data.get("gallery", [])
            if gallery_filenames:
                gallery_imgs = [images.get(name) for name in gallery_filenames if images.get(name)]
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
            checkpoint_image = images.get(image_filename) if image_filename else None

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
            self.stdout.write(
                self.style.SUCCESS(f"  → Created {len(checkpoints)} checkpoints for '{route}'")
            )

    @property
    def sample_images_dir(self) -> Path:
        return resolve_seed_asset_dir(
            domain="routes",
            asset_type="images",
            legacy_dir=Path(__file__).resolve().parent / "images",
            warning_writer=lambda msg: self.stdout.write(self.style.WARNING(msg)),
        )

    def _ensure_media_files(self) -> dict[str, ImageFile]:
        image_map = {}
        images_dir = self.sample_images_dir
        if images_dir.exists():
            for image_path in images_dir.glob("*.png"):
                if image_path.is_file():
                    image_map[image_path.name] = self._create_image_file(image_path)
        return image_map

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

