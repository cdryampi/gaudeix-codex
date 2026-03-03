"""
Seed example festes with translations, sponsors, and media files.

Usage: python manage.py seed_festes
"""

from __future__ import annotations

import json
import mimetypes
from datetime import date
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Category
from festes.models import (
    Festa,
    FestaCategorySingleton,
    FestaEvent,
    Program,
    ProgramStatusChoices,
    Sponsor,
)
from core.seed_utils import list_files_sorted
from media_files.models import ImageFile, DocumentFile
from events.models import Event


class Command(BaseCommand):
    help = (
        "Seed sample festes with multilingual content, sponsors and images. "
        "Run `seed_festes_category` first."
    )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding sample festes."))
        with transaction.atomic():
            root_category = self._ensure_root_category()
            self._clear_festes()
            images = self._ensure_media_files()
            documents = self._ensure_document_files()
            self._create_festes(root_category, images, documents)

    def _ensure_root_category(self) -> Category:
        try:
            singleton = FestaCategorySingleton.objects.get(pk=1)
            return singleton.category
        except FestaCategorySingleton.DoesNotExist:
            # Create minimal category if not exists
            category, _ = Category.objects.get_or_create(
                slug="festes",
                defaults={"nombre": "Festes", "taxonomy": "festes"},
            )
            FestaCategorySingleton.objects.create(pk=1, category=category)
            self.stdout.write(
                self.style.WARNING(
                    "Festes category singleton not found, created minimal version. "
                    "Run seed_festes_category for full setup."
                )
            )
            return category

    def _clear_festes(self) -> None:
        # Sponsors are deleted via cascade
        count = Festa.objects.count()
        Festa.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Removed {count} existing festes."))

    def _create_festes(self, root_category: Category, images: dict[str, ImageFile], documents: dict[str, DocumentFile]) -> None:
        festes_data = self._load_seed_festes()

        for data in festes_data:
            slug = data.get("slug")

            # Parse dates
            start_date = self._parse_date(data["start_date"])
            end_date = self._parse_date(data["end_date"])

            # Handle is_current constraint - only one can be true
            is_current = data.get("is_current", False)
            if is_current:
                # Clear any existing current festa
                Festa.objects.filter(is_current=True).update(is_current=False)

            # Find matching image by slug
            featured_media = images.get(f"{slug}.png")
            program_pdf = documents.get(f"programa-{slug}.pdf")

            festa = Festa.objects.create(
                slug=slug,
                title=data["title"],
                subtitle=data.get("subtitle", ""),
                summary=data.get("summary", ""),
                description=data.get("description", ""),
                program_text=data.get("program_text", ""),
                start_date=start_date,
                end_date=end_date,
                year=data["year"],
                category=root_category,
                is_published=data.get("is_published", True),
                is_featured=data.get("is_featured", False),
                is_current=is_current,
                featured_media=featured_media,
                program_pdf=program_pdf,
            )

            if featured_media:
                festa.posters.add(featured_media)

            # Add gallery images (any image starting with 'gallery_')
            gallery_media = [img for name, img in images.items() if name.startswith("gallery_")]
            if gallery_media:
                festa.gallery.set(gallery_media)

            # Create sponsors
            for sponsor_data in data.get("sponsors", []):
                tier = sponsor_data.get("tier", "collaborator")
                logo = images.get(f"sponsor_{tier}.png")
                
                Sponsor.objects.create(
                    festa=festa,
                    name=sponsor_data["name"],
                    tier=tier,
                    website=sponsor_data.get("website", ""),
                    order=sponsor_data.get("order", 0),
                    logo=logo,
                )

            self._apply_translations(festa, data.get("translations", {}))
            
            # Link to some random events to demonstrate the event selector
            self._link_random_events(festa)

            # Create a sample Program for each seeded Festa.
            self._create_sample_program(festa)
            
            self.stdout.write(self.style.SUCCESS(f"Created festa '{festa}'"))

    def _link_random_events(self, festa: Festa) -> None:
        # Get up to 15 random published events
        random_events = Event.objects.filter(is_published=True).order_by('?')[:15]
        for idx, event in enumerate(random_events):
            FestaEvent.objects.create(
                festa=festa,
                event=event,
                order=idx,
            )

    def _create_sample_program(self, festa: Festa) -> None:
        program = Program.objects.create(
            festa=festa,
            title=f"Programa Principal - {festa.title}",
            status=ProgramStatusChoices.PUBLISHED,
            order=1,
        )
        program.set_current_language("ca")
        program.save()
    def _parse_date(self, date_str: str) -> date:
        """Parse ISO date string to date object."""
        return date.fromisoformat(date_str)

    def _load_seed_festes(self) -> list[dict]:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "festes.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, list):
            raise CommandError(f"Expected a JSON array in {seed_path}")
        return data

    def _apply_translations(self, festa: Festa, translations: dict) -> None:
        for language_code, values in translations.items():
            if not isinstance(values, dict):
                continue
            festa.set_current_language(language_code)
            if "title" in values:
                festa.title = values["title"]
            if "subtitle" in values:
                festa.subtitle = values["subtitle"]
            if "summary" in values:
                festa.summary = values["summary"]
            if "description" in values:
                festa.description = values["description"]
            if "program_text" in values:
                festa.program_text = values["program_text"]
            festa.save()

    @property
    def sample_images_dir(self) -> Path:
        return Path(__file__).resolve().parent / "images"

    def _ensure_media_files(self) -> dict[str, ImageFile]:
        image_map = {}
        images_dir = self.sample_images_dir
        if images_dir.exists():
            for image_path in list_files_sorted(images_dir, "*.png"):
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

    @property
    def sample_documents_dir(self) -> Path:
        return Path(__file__).resolve().parent / "documents"

    def _ensure_document_files(self) -> dict[str, DocumentFile]:
        doc_map = {}
        docs_dir = self.sample_documents_dir
        if docs_dir.exists():
            for doc_path in list_files_sorted(docs_dir, "*.pdf"):
                doc_map[doc_path.name] = self._create_document_file(doc_path)
        return doc_map

    def _create_document_file(self, path: Path) -> DocumentFile:
        with path.open("rb") as source:
            instance = DocumentFile.objects.create(
                file=File(source, name=path.name),
                original_name=path.name,
                mime_type="application/pdf",
                size_bytes=path.stat().st_size,
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded DocumentFile from {path}"))
        return instance


