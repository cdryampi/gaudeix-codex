"""
Seed example festes with translations, sponsors, and media files.

Usage: python manage.py seed_festes [--dry-run]
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
from core.seed_manifest import load_seed_asset_manifest, render_dry_run
from events.models import Event
from festes.models import Festa, FestaCategorySingleton, FestaEvent, Program, ProgramStatusChoices, Sponsor
from media_files.models import DocumentFile, ImageFile


class Command(BaseCommand):
    help = (
        "Seed sample festes with multilingual content, sponsors and images. "
        "Run `seed_festes_category` first."
    )

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Print resolved asset attachments and exit.")

    def handle(self, *args, **options):
        manifest_entries = self._load_asset_manifest()
        if options.get("dry_run"):
            self.stdout.write(render_dry_run(manifest_entries, title="festes asset manifest"))
            return

        self.stdout.write(self.style.WARNING("Seeding sample festes."))
        with transaction.atomic():
            root_category = self._ensure_root_category()
            self._clear_festes()
            images, documents = self._ensure_media_files(manifest_entries)
            self._create_festes(root_category, images, documents)

    def _load_asset_manifest(self):
        return load_seed_asset_manifest(
            manifest_path=Path(__file__).resolve().parents[2] / "seed" / "festes_assets.yaml",
            assets_root=Path(__file__).resolve().parent,
            allowed_types={"image", "document"},
            allowed_attach_to={"featured_media", "program_pdf", "sponsor_logo", "gallery"},
        )

    def _ensure_root_category(self) -> Category:
        try:
            singleton = FestaCategorySingleton.objects.get(pk=1)
            return singleton.category
        except FestaCategorySingleton.DoesNotExist:
            category, _ = Category.objects.get_or_create(slug="festes", defaults={"nombre": "Festes", "taxonomy": "festes"})
            FestaCategorySingleton.objects.create(pk=1, category=category)
            self.stdout.write(self.style.WARNING("Festes category singleton not found, created minimal version. Run seed_festes_category for full setup."))
            return category

    def _clear_festes(self) -> None:
        count = Festa.objects.count()
        Festa.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Removed {count} existing festes."))

    def _create_festes(self, root_category: Category, images: dict[str, ImageFile], documents: dict[str, DocumentFile]) -> None:
        festes_data = self._load_seed_festes()

        for data in festes_data:
            slug = data.get("slug")
            start_date = self._parse_date(data["start_date"])
            end_date = self._parse_date(data["end_date"])

            is_current = data.get("is_current", False)
            if is_current:
                Festa.objects.filter(is_current=True).update(is_current=False)

            featured_media = images.get(f"featured_media:{slug}")
            program_pdf = documents.get(f"program_pdf:{slug}")

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

            gallery_media = [img for key, img in images.items() if key.startswith("gallery:")]
            if gallery_media:
                festa.gallery.set(gallery_media)

            for sponsor_data in data.get("sponsors", []):
                tier = sponsor_data.get("tier", "collaborator")
                logo = images.get(f"sponsor_logo:{tier}")
                Sponsor.objects.create(
                    festa=festa,
                    name=sponsor_data["name"],
                    tier=tier,
                    website=sponsor_data.get("website", ""),
                    order=sponsor_data.get("order", 0),
                    logo=logo,
                )

            self._apply_translations(festa, data.get("translations", {}))
            self._link_random_events(festa)
            self._create_sample_program(festa)
            self.stdout.write(self.style.SUCCESS(f"Created festa '{festa}'"))

    def _link_random_events(self, festa: Festa) -> None:
        random_events = Event.objects.filter(is_published=True).order_by("?")[:15]
        for idx, event in enumerate(random_events):
            FestaEvent.objects.create(festa=festa, event=event, order=idx)

    def _create_sample_program(self, festa: Festa) -> None:
        program = Program.objects.create(festa=festa, title=f"Programa Principal - {festa.title}", status=ProgramStatusChoices.PUBLISHED, order=1)
        program.set_current_language("ca")
        program.save()

    def _parse_date(self, date_str: str) -> date:
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

    def _ensure_media_files(self, manifest_entries) -> tuple[dict[str, ImageFile], dict[str, DocumentFile]]:
        image_map: dict[str, ImageFile] = {}
        doc_map: dict[str, DocumentFile] = {}

        for entry in manifest_entries:
            key = f"{entry.attach_to}:{entry.slug_or_key}"
            if entry.type == "image":
                image_map[key] = self._create_image_file(entry.resolved_path)
            elif entry.type == "document":
                doc_map[key] = self._create_document_file(entry.resolved_path)

        return image_map, doc_map

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
                mime_type="application/pdf",
                size_bytes=path.stat().st_size,
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded DocumentFile from {path}"))
        return instance
