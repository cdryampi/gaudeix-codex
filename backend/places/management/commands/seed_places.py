"""
Management command to seed example places with translations and media attachments.

Usage: python manage.py seed_places
"""

from __future__ import annotations

import mimetypes
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Category
from media_files.models import DocumentFile, ImageFile
from places.models import Place, PlaceCategorySingleton


class Command(BaseCommand):
    help = (
        "Seed example places with multilingual titles/descriptions. "
        "Check media files and categories before running."
    )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding sample places. Verify media files before use."))
        with transaction.atomic():
            root_category = self._ensure_root_category()
            self._clear_places()
            images, documents = self._ensure_media_files()
            self._create_places(root_category, images, documents)

    def _ensure_root_category(self) -> Category:
        category, _ = Category.objects.get_or_create(slug="places", defaults={"nombre": "Places"})
        singleton, _ = PlaceCategorySingleton.objects.get_or_create(pk=1, defaults={"category": category})
        if singleton.category != category:
            singleton.category = category
            singleton.save()
        return category

    def _clear_places(self) -> None:
        count = Place.objects.count()
        Place.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Removed {count} existing places."))

    def _create_places(self, root_category: Category, images: list[ImageFile], documents: list[DocumentFile]) -> None:
        places_data = [
            {
                "title": "Central Park",
                "description": "Large urban park with walking trails and lakes.",
                "location_text": "City Center",
                "latitude": 40.785091,
                "longitude": -73.968285,
                "category_slug": "poi",
                "translations": {
                    "es": {"title": "Parque Central", "description": "Gran parque urbano con senderos y lagos."},
                    "ca": {"title": "Parc Central", "description": "Gran parc urbà amb camins i llacs."},
                },
            },
            {
                "title": "Sunset Beach",
                "description": "Wide sandy beach ideal for sunsets.",
                "location_text": "Coast Avenue",
                "latitude": 36.7783,
                "longitude": -119.4179,
                "category_slug": "beach",
                "translations": {
                    "es": {"title": "Playa Sunset", "description": "Amplia playa de arena ideal para atardeceres."},
                    "ca": {"title": "Platja Sunset", "description": "Àmplia platja de sorra ideal per a capvespres."},
                },
            },
            {
                "title": "Mountain Viewpoint",
                "description": "Panoramic views of the valley.",
                "location_text": "Trail KM 5",
                "latitude": 42.0,
                "longitude": 2.0,
                "category_slug": "viewpoint",
                "translations": {
                    "es": {"title": "Mirador de la Montaña", "description": "Vistas panorámicas del valle."},
                    "ca": {"title": "Mirador de la Muntanya", "description": "Vistes panoràmiques de la vall."},
                },
            },
            {
                "title": "Museum of Modern Art",
                "description": "Contemporary exhibitions and guided tours.",
                "location_text": "Old Town",
                "latitude": 41.3874,
                "longitude": 2.1686,
                "category_slug": "museum",
                "translations": {
                    "es": {"title": "Museo de Arte Moderno", "description": "Exposiciones contemporáneas y visitas guiadas."},
                    "ca": {"title": "Museu d'Art Modern", "description": "Exposicions contemporànies i visites guiades."},
                },
            },
            {
                "title": "Seaside Hotel",
                "description": "4-star hotel with sea views and spa.",
                "location_text": "Harbor Road 12",
                "latitude": 41.0,
                "longitude": 1.0,
                "category_slug": "hotel",
                "translations": {
                    "es": {"title": "Hotel Marítimo", "description": "Hotel de 4 estrellas con vistas al mar y spa."},
                    "ca": {"title": "Hotel Marítim", "description": "Hotel de 4 estrelles amb vistes al mar i spa."},
                },
            },
            {
                "title": "Local Bistro",
                "description": "Seasonal cuisine with local ingredients.",
                "location_text": "Market Square 8",
                "latitude": 41.4,
                "longitude": 2.17,
                "category_slug": "restaurant",
                "translations": {
                    "es": {"title": "Bistró Local", "description": "Cocina de temporada con ingredientes locales."},
                    "ca": {"title": "Bistró Local", "description": "Cuina de temporada amb ingredients locals."},
                },
            },
            {
                "title": "Boutique Apartments",
                "description": "Serviced apartments in downtown.",
                "location_text": "Main Street 5",
                "latitude": 40.4168,
                "longitude": -3.7038,
                "category_slug": "apartment",
                "translations": {
                    "es": {"title": "Apartamentos Boutique", "description": "Apartamentos con servicios en el centro."},
                    "ca": {"title": "Apartaments Boutique", "description": "Apartaments amb serveis al centre."},
                },
            },
            {
                "title": "Craft Beer Bar",
                "description": "Taproom with rotating local brews.",
                "location_text": "River Street 22",
                "latitude": 41.38,
                "longitude": 2.15,
                "category_slug": "bar",
                "translations": {
                    "es": {"title": "Bar de Cerveza Artesanal", "description": "Taproom con cervezas locales rotativas."},
                    "ca": {"title": "Bar de Cervesa Artesanal", "description": "Taproom amb cerveses locals rotatives."},
                },
            },
        ]

        for index, data in enumerate(places_data):
            category = (
                Category.objects.filter(slug=data.get("category_slug")).first()
                or root_category
            )
            place = Place.objects.create(
                title=data["title"],
                description=data.get("description", ""),
                location_text=data.get("location_text", ""),
                latitude=data.get("latitude"),
                longitude=data.get("longitude"),
                category=category,
                featured_media=self._pick_media(images, index),
            )

            if documents:
                place.attachments.add(documents[index % len(documents)])

            self._apply_translations(place, data.get("translations", {}))
            self.stdout.write(self.style.SUCCESS(f"Created place '{place}'"))

    def _apply_translations(self, place: Place, translations: dict) -> None:
        for language_code, values in translations.items():
            place.set_current_language(language_code)
            place.title = values.get("title", place.title)
            place.description = values.get("description", place.description)
            place.save()

    def _pick_media(self, images: list[ImageFile], index: int):
        if not images:
            return None
        return images[index % len(images)]

    @property
    def sample_files_dir(self) -> Path:
        return Path(__file__).resolve().parents[2] / "tests" / "files"

    @property
    def sample_images_dir(self) -> Path:
        return Path(__file__).resolve().parent / "images"

    def _ensure_media_files(self) -> tuple[list[ImageFile], list[DocumentFile]]:
        images = list(ImageFile.objects.all())
        documents = list(DocumentFile.objects.all())

        # Prefer bundled seed images in management/commands/images
        images_dir = self.sample_images_dir
        if images_dir.exists():
            for image_path in sorted(images_dir.glob("*")):
                if image_path.is_file():
                    images.append(self._create_image_file(image_path))
        else:
            self.stdout.write(
                self.style.WARNING(
                    f"Sample images directory not found at {images_dir}. Places will seed without new images."
                )
            )

        # Fallback document sample from tests fixtures
        files_dir = self.sample_files_dir
        if files_dir.exists():
            document_path = files_dir / "sample.pdf"
            if document_path.exists():
                documents.append(self._create_document_file(document_path))
        else:
            self.stdout.write(
                self.style.WARNING(
                    f"Sample files directory not found at {files_dir}. Places will seed without document files."
                )
            )

        return images, documents

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

    def _create_document_file(self, path: Path) -> DocumentFile:
        with path.open("rb") as source:
            instance = DocumentFile.objects.create(
                file=File(source, name=path.name),
                original_name=path.name,
                mime_type=mimetypes.guess_type(path.name)[0] or "application/pdf",
                size_bytes=path.stat().st_size,
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded DocumentFile from {path}"))
        return instance
