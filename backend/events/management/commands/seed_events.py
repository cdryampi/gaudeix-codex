"""
Management command to seed example events with translations, categories, tags and media.

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

from core.models import Category, Tag
from events.models import Event, EventCategorySingleton
from media_files.models import DocumentFile, ImageFile


class Command(BaseCommand):
    help = (
        "Seed sample events with multilingual title/summary/description, categories, tags and media. "
        "Run `seed_events_category` and `seed_tags` first for best results."
    )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding sample events. Verify media, categories and tags before use."))
        with transaction.atomic():
            root_category = self._ensure_root_category()
            self._clear_events()
            images, documents = self._ensure_media_files()
            self._create_events(root_category, images, documents)

    def _ensure_root_category(self) -> Category:
        category, _ = Category.objects.get_or_create(
            slug="events",
            defaults={"nombre": "Events", "taxonomy": "events"},
        )
        if category.taxonomy != "events":
            category.taxonomy = "events"
            category.save(update_fields=["taxonomy"])

        singleton, _ = EventCategorySingleton.objects.get_or_create(pk=1, defaults={"category": category})
        if singleton.category != category:
            singleton.category = category
            singleton.save(update_fields=["category"])
        return category

    def _clear_events(self) -> None:
        count = Event.objects.count()
        Event.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Removed {count} existing events."))

    def _create_events(self, root_category: Category, images: list[ImageFile], documents: list[DocumentFile]) -> None:
        images = images or []
        documents = documents or []

        events_data: list[dict] = [
            {
                "title": "Mercat de producte local",
                "summary": "Parades de proximitat, degustacions i artesania.",
                "description": "Activitat al centre del poble amb parades i productes locals.",
                "start_at": self._datetime_from_now(days=2, hours=11),
                "end_at": self._datetime_from_now(days=2, hours=14),
                "venue_name": "Mercat a la placa",
                "location_text": "Placa del Poble",
                "is_featured": True,
                "is_free": True,
                "price_text": "",
                "category_slug": "fires-i-mercats",
                "tag_slugs": ["mercat", "producte-local", "artesania"],
                "translations": {
                    "es": {
                        "title": "Mercado de producto local",
                        "summary": "Puestos de proximidad, degustaciones y artesania.",
                        "description": "Actividad en el centro del pueblo con puestos y producto local.",
                    },
                },
            },
            {
                "title": "Taller infantil: manualitats",
                "summary": "Activitat creativa per a infants.",
                "description": "Taller amb materials reciclats i recursos naturals.",
                "start_at": self._datetime_from_now(days=3, hours=17),
                "end_at": self._datetime_from_now(days=3, hours=19),
                "venue_name": "Centre Civic",
                "location_text": "Placa de l'Ajuntament",
                "is_featured": False,
                "is_free": True,
                "price_text": "",
                "category_slug": "infantil",
                "tag_slugs": ["infantil", "taller", "familia"],
            },
            {
                "title": "Ruta guiada pel patrimoni",
                "summary": "Passejada amb guia per descobrir racons locals.",
                "description": "Ruta guiada per coneixer el patrimoni i la historia del municipi.",
                "start_at": self._datetime_from_now(days=5, hours=11),
                "end_at": self._datetime_from_now(days=5, hours=13),
                "venue_name": "Punt de trobada",
                "location_text": "Placa Major",
                "is_featured": False,
                "is_free": False,
                "price_text": "5 EUR",
                "category_slug": "cultura",
                "tag_slugs": ["ruta", "patrimoni", "visita-guiada"],
            },
            {
                "title": "Teatre: comedia a la fresca",
                "summary": "Una comedia amable per gaudir en comunitat.",
                "description": "Representacio al teatre municipal amb actors convidats.",
                "start_at": self._datetime_from_now(days=7, hours=20),
                "end_at": self._datetime_from_now(days=7, hours=22),
                "venue_name": "Teatre La Sala",
                "location_text": "Centre Cultural",
                "is_featured": True,
                "is_free": False,
                "price_text": "10 EUR",
                "category_slug": "teatre",
                "tag_slugs": ["teatre", "comedia"],
            },
            {
                "title": "Concert de musica classica",
                "summary": "Repertori classic amb interprets convidats.",
                "description": "Concert al vespre amb peces classiques.",
                "start_at": self._datetime_from_now(days=10, hours=19),
                "end_at": self._datetime_from_now(days=10, hours=21),
                "venue_name": "Esglesia Parroquial",
                "location_text": "Placa de l'Esglesia",
                "is_featured": False,
                "is_free": False,
                "price_text": "Aportacio voluntaria",
                "category_slug": "musica",
                "tag_slugs": ["musica", "concert", "classica"],
            },
            {
                "title": "Xerrada: convivencia i civisme",
                "summary": "Espai obert per compartir propostes.",
                "description": "Sessio participativa per millorar el dia a dia del municipi.",
                "start_at": self._datetime_from_now(days=12, hours=19),
                "end_at": self._datetime_from_now(days=12, hours=20),
                "venue_name": "Casal d'Entitats",
                "location_text": "Avinguda del Maresme",
                "is_featured": False,
                "is_free": True,
                "price_text": "",
                "category_slug": "altres",
                "tag_slugs": ["xerrada", "participacio"],
            },
            {
                "title": "Formacio: competències digitals basiques",
                "summary": "Sessio practica sobre tramits online i seguretat.",
                "description": "Formacio per fer gestions digitals i millorar la seguretat.",
                "start_at": self._datetime_from_now(days=15, hours=18),
                "end_at": self._datetime_from_now(days=15, hours=20),
                "venue_name": "Biblioteca Municipal",
                "location_text": "Carrer de la Riera",
                "is_featured": False,
                "is_free": True,
                "price_text": "",
                "category_slug": "formacio",
                "tag_slugs": ["formacio", "digital", "ajuda"],
            },
            {
                "title": "Activitat esportiva: caminada popular",
                "summary": "Recorregut accessible per fomentar el benestar.",
                "description": "Caminada popular amb ruta senyalitzada i avituallament.",
                "start_at": self._datetime_from_now(days=18, hours=9),
                "end_at": self._datetime_from_now(days=18, hours=12),
                "venue_name": "Pavello Municipal",
                "location_text": "Zona Esportiva",
                "is_featured": True,
                "is_free": True,
                "price_text": "",
                "category_slug": "esports",
                "tag_slugs": ["esports", "caminada", "salut"],
            },
        ]

        for index, data in enumerate(events_data):
            category = Category.objects.filter(slug=data.get("category_slug")).first() or root_category
            event = Event.objects.create(
                title=data["title"],
                summary=data.get("summary", ""),
                description=data.get("description", ""),
                start_at=data["start_at"],
                end_at=data.get("end_at"),
                is_published=data.get("is_published", True),
                venue_name=data.get("venue_name", ""),
                location_text=data.get("location_text", ""),
                is_featured=data.get("is_featured", False),
                is_free=data.get("is_free", True),
                price_text=data.get("price_text", ""),
                category=category,
                featured_media=self._pick_media(images, index),
            )

            if documents:
                event.attachments.add(documents[index % len(documents)])

            tag_slugs = data.get("tag_slugs", []) or []
            if tag_slugs:
                event.tags.set(self._resolve_tags(tag_slugs))

            self._apply_translations(event, data.get("translations", {}))
            self.stdout.write(self.style.SUCCESS(f"Created event '{event}'"))

    def _resolve_tags(self, slugs: list[str]) -> list[Tag]:
        tags = list(Tag.objects.filter(slug__in=slugs))
        by_slug = {t.slug: t for t in tags}
        resolved: list[Tag] = []
        for slug in slugs:
            if slug in by_slug:
                resolved.append(by_slug[slug])
                continue
            resolved.append(Tag.objects.create(slug=slug, nombre=slug.replace("-", " ").title()))
        return resolved

    def _apply_translations(self, event: Event, translations: dict) -> None:
        for language_code, values in translations.items():
            event.set_current_language(language_code)
            event.title = values.get("title", event.title)
            event.summary = values.get("summary", event.summary)
            event.description = values.get("description", event.description)
            event.save()

    def _pick_media(self, images: list[ImageFile], index: int):
        if not images:
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
                    f"Sample media directory not found at {sample_dir}. Events will seed without new media."
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

