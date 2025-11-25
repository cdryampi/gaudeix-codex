"""
Management command to seed example events with translations and media attachments.

Review media and (future) place references before running this command.
Usage: python manage.py seed_events
"""

from __future__ import annotations

import mimetypes
from datetime import timedelta
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from events.models import Event
from media_files.models import DocumentFile, ImageFile


class Command(BaseCommand):
    help = (
        "Seed about 10 example events with multilingual titles/descriptions. "
        "Check media IDs and locations before running."
    )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.WARNING(
                "Seeding sample events. Verify media files and locations before use."
            )
        )
        with transaction.atomic():
            self._clear_events()
            images, documents = self._ensure_media_files()
            self._create_events(images, documents)

    def _clear_events(self) -> None:
        count = Event.objects.count()
        Event.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Removed {count} existing events."))

    def _create_events(self, images: list[ImageFile], documents: list[DocumentFile]) -> None:
        images = images or []
        documents = documents or []

        events_data = [
            {
                "title": "Spring Festival",
                "description": "Music, food, and activities to welcome the season.",
                "start_at": self._datetime_from_now(days=5, hours=18),
                "end_at": self._datetime_from_now(days=5, hours=22),
                "location_text": "Plaça Major",
                "translations": {
                    "es": {
                        "title": "Festival de Primavera",
                        "description": "Música, comida y actividades para recibir la temporada.",
                    },
                    "ca": {
                        "title": "Festival de Primavera",
                        "description": "Música, menjar i activitats per donar la benvinguda a la temporada.",
                    },
                },
            },
            {
                "title": "Tech Meetup",
                "description": "Monthly meetup for local developers.",
                "start_at": self._datetime_from_now(days=14, hours=19),
                "end_at": self._datetime_from_now(days=14, hours=21),
                "location_text": "Coworking Space",
                "translations": {
                    "es": {
                        "title": "Encuentro Tecnológico",
                        "description": "Reunión mensual para desarrolladores locales.",
                    },
                    "ca": {
                        "title": "Trobada Tecnològica",
                        "description": "Reunió mensual per a desenvolupadors locals.",
                    },
                },
            },
            {
                "title": "Jazz Night",
                "description": "Local bands perform classic and modern jazz.",
                "start_at": self._datetime_from_now(days=-3, hours=20),
                "end_at": self._datetime_from_now(days=-3, hours=23),
                "location_text": "City Theater",
                "translations": {
                    "es": {"title": "Noche de Jazz", "description": "Bandas locales interpretan jazz clásico y moderno."},
                    "ca": {"title": "Nit de Jazz", "description": "Bandes locals interpreten jazz clàssic i modern."},
                },
            },
            {
                "title": "Beach Cleanup",
                "description": "Community effort to clean the coastline.",
                "start_at": self._datetime_from_now(days=-7, hours=9),
                "end_at": self._datetime_from_now(days=-7, hours=12),
                "location_text": "North Beach",
                "is_published": False,
                "translations": {
                    "es": {"title": "Limpieza de Playa", "description": "Acción comunitaria para limpiar la costa."},
                    "ca": {"title": "Neteja de Platja", "description": "Acció comunitària per netejar la costa."},
                },
            },
            {
                "title": "Street Food Market",
                "description": "Vendors from across the region.",
                "start_at": self._datetime_from_now(days=1, hours=12),
                "end_at": self._datetime_from_now(days=1, hours=18),
                "location_text": "Old Town",
                "translations": {
                    "es": {"title": "Mercado de Comida Callejera", "description": "Puestos de comida de toda la región."},
                    "ca": {"title": "Mercat de Menjar de Carrer", "description": "Parades de menjar de tota la regió."},
                },
            },
            {
                "title": "Art Expo",
                "description": "Exhibition featuring emerging artists.",
                "start_at": self._datetime_from_now(days=30, hours=10),
                "end_at": self._datetime_from_now(days=30, hours=19),
                "location_text": "Cultural Center",
                "translations": {
                    "es": {"title": "Expo de Arte", "description": "Exposición con artistas emergentes."},
                    "ca": {"title": "Expo d'Art", "description": "Exposició amb artistes emergents."},
                },
            },
            {
                "title": "Mountain Hike",
                "description": "Guided hike with limited spots.",
                "start_at": self._datetime_from_now(days=10, hours=7),
                "end_at": self._datetime_from_now(days=10, hours=15),
                "location_text": "Montserrat",
                "translations": {
                    "es": {"title": "Excursión a la Montaña", "description": "Ruta guiada con plazas limitadas."},
                    "ca": {"title": "Excursió a la Muntanya", "description": "Ruta guiada amb places limitades."},
                },
            },
            {
                "title": "Movie Marathon",
                "description": "Classic films all weekend.",
                "start_at": self._datetime_from_now(days=-20, hours=16),
                "end_at": self._datetime_from_now(days=-20, hours=23),
                "location_text": "Cinema Bar",
                "translations": {
                    "es": {"title": "Maratón de Cine", "description": "Películas clásicas durante todo el fin de semana."},
                    "ca": {"title": "Marató de Cinema", "description": "Pel·lícules clàssiques durant tot el cap de setmana."},
                },
            },
            {
                "title": "Startup Pitch Day",
                "description": "Local startups present their projects.",
                "start_at": self._datetime_from_now(days=21, hours=15),
                "end_at": self._datetime_from_now(days=21, hours=19),
                "location_text": "Innovation Hub",
                "is_published": False,
                "translations": {
                    "es": {"title": "Día de Pitches", "description": "Startups locales presentan sus proyectos."},
                    "ca": {"title": "Dia de Pitches", "description": "Startups locals presenten els seus projectes."},
                },
            },
            {
                "title": "Winter Gala",
                "description": "Formal evening with live orchestra.",
                "start_at": self._datetime_from_now(days=60, hours=20),
                "end_at": self._datetime_from_now(days=60, hours=23),
                "location_text": "Grand Hall",
                "translations": {
                    "es": {"title": "Gala de Invierno", "description": "Noche formal con orquesta en vivo."},
                    "ca": {"title": "Gala d'Hivern", "description": "Vespre formal amb orquestra en viu."},
                },
            },
        ]

        for index, data in enumerate(events_data):
            event = Event.objects.create(
                title=data["title"],
                description=data.get("description", ""),
                start_at=data["start_at"],
                end_at=data.get("end_at"),
                is_published=data.get("is_published", True),
                location_text=data.get("location_text", ""),
                featured_media=self._pick_media(images, index),
            )

            if documents:
                event.attachments.add(documents[index % len(documents)])
            else:
                # TODO: add DocumentFile records if attachments are required before running the seed
                pass

            self._apply_translations(event, data.get("translations", {}))
            self.stdout.write(self.style.SUCCESS(f"Created event '{event}'"))

    def _apply_translations(self, event: Event, translations: dict) -> None:
        for language_code, values in translations.items():
            event.set_current_language(language_code)
            event.title = values.get("title", event.title)
            event.description = values.get("description", event.description)
            event.save()

    def _pick_media(self, images: list[ImageFile], index: int):
        if not images:
            # TODO: add ImageFile records before running if featured_media is desired
            return None
        return images[index % len(images)]

    def _datetime_from_now(self, days: int = 0, hours: int = 0):
        return timezone.now() + timedelta(days=days, hours=hours)

    def _ensure_media_files(self) -> tuple[list[ImageFile], list[DocumentFile]]:
        """
        Ensure at least one ImageFile and DocumentFile exist using local sample files.
        """
        images = list(ImageFile.objects.all())
        documents = list(DocumentFile.objects.all())

        sample_dir = self.sample_files_dir
        if not sample_dir.exists():
            self.stdout.write(
                self.style.WARNING(
                    f"Sample media directory not found at {sample_dir}. "
                    "Events will seed without new media."
                )
            )
            return images, documents

        if not images:
            image_path = sample_dir / "sample.png"
            if image_path.exists():
                images.append(self._create_image_file(image_path))

        if not documents:
            document_path = sample_dir / "sample.pdf"
            if document_path.exists():
                documents.append(self._create_document_file(document_path))

        return images, documents

    @property
    def sample_files_dir(self) -> Path:
        return Path(__file__).resolve().parents[2] / "tests" / "files"

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
