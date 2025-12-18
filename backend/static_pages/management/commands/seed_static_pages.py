from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.core.files.base import ContentFile
from django.db import transaction

from static_pages.models import StaticPage
from media_files.models import ImageFile, DocumentFile


class Command(BaseCommand):
    help = "Seed predefined static pages with fixed templates and slugs."

    def add_arguments(self, parser):
        parser.add_argument(
            "--featured_media_id",
            type=int,
            help="Optional image ID to set as featured_media for all pages",
        )
        parser.add_argument(
            "--attachment_id",
            type=int,
            help="Optional document ID to set as attachment for all pages",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all existing static pages before seeding",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        featured_media_id = options.get("featured_media_id")
        attachment_id = options.get("attachment_id")
        reset = options.get("reset")
        seed_dir = Path(__file__).resolve().parents[2] / "seed"

        if reset:
            StaticPage.objects.all().delete()
            self.stdout.write(self.style.WARNING("Deleted existing static pages"))

        if not featured_media_id:
            sample_image_path = seed_dir / "sample_file_static_image.jpg"
            if sample_image_path.exists():
                featured_media_id = self._create_sample_image(sample_image_path).id
                self.stdout.write(self.style.NOTICE(f"Sample image ready: {featured_media_id}"))
        if not attachment_id:
            sample_pdf_path = seed_dir / "sample_file_static_file.pdf"
            if sample_pdf_path.exists():
                attachment_id = self._create_sample_document(sample_pdf_path).id
                self.stdout.write(self.style.NOTICE(f"Sample document ready: {attachment_id}"))

        created = 0
        updated = 0

        pages = self._load_seed_pages(seed_dir / "static_pages.json")
        for entry in pages:
            slug = entry["slug"]
            template = entry["template"]
            is_published = entry.get("is_published", True)
            page, was_created = StaticPage.objects.get_or_create(
                template=template,
                defaults={
                    "slug": slug,
                    "is_published": is_published,
                },
            )

            changed = False
            if page.slug != slug:
                page.slug = slug
                changed = True
            if page.is_published != is_published:
                page.is_published = is_published
                changed = True
            if featured_media_id and page.featured_media_id != featured_media_id:
                page.featured_media_id = featured_media_id
                changed = True
            if attachment_id and page.attachment_id != attachment_id:
                page.attachment_id = attachment_id
                changed = True

            translations = entry.get("translations", {}) or {}
            for lang_code, values in translations.items():
                if not isinstance(values, dict):
                    continue
                page.set_current_language(lang_code)
                if "titulo" in values:
                    page.titulo = values["titulo"]
                    changed = True
                if "cuerpo" in values:
                    page.cuerpo = values["cuerpo"]
                    changed = True

            if changed:
                page.save()

            if was_created:
                created += 1
            else:
                updated += 1 if changed else 0

        self.stdout.write(self.style.SUCCESS(f"Static pages created: {created}, updated: {updated}"))

    def _load_seed_pages(self, seed_path: Path) -> list[dict]:
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        pages = data.get("pages") if isinstance(data, dict) else None
        if not isinstance(pages, list):
            raise CommandError(f"Expected a 'pages' array in {seed_path}")
        return pages

    def _create_sample_image(self, path: Path) -> ImageFile:
        with path.open("rb") as fp:
            data = fp.read()
        content = ContentFile(data, name=path.name)
        obj, _ = ImageFile.objects.get_or_create(
            original_name=path.name,
            defaults={
                "file": content,
                "mime_type": "image/jpeg",
                "size_bytes": len(data),
            },
        )
        return obj

    def _create_sample_document(self, path: Path) -> DocumentFile:
        with path.open("rb") as fp:
            data = fp.read()
        content = ContentFile(data, name=path.name)
        obj, _ = DocumentFile.objects.get_or_create(
            original_name=path.name,
            defaults={
                "file": content,
                "mime_type": "application/pdf",
                "size_bytes": len(data),
            },
        )
        return obj
