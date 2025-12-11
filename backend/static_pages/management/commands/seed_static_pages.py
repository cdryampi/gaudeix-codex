from __future__ import annotations

from pathlib import Path

from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.db import transaction

from static_pages.models import StaticPage
from static_pages.seed.sample_data import SAMPLE_STATIC_PAGES
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
        seed_dir = Path(__file__).resolve().parent.parent.parent / "seed"

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

        for entry in SAMPLE_STATIC_PAGES:
            slug = entry["slug"]
            template = entry["template"]
            title = entry["title"]
            body = entry.get("body", "")
            page, was_created = StaticPage.objects.get_or_create(
                template=template,
                defaults={
                    "slug": slug,
                    "is_published": True,
                },
            )
            page.set_current_language("ca")
            page.titulo = title
            page.cuerpo = body
            if featured_media_id:
                page.featured_media_id = featured_media_id
            if attachment_id:
                page.attachment_id = attachment_id
            page.save()
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(self.style.SUCCESS(f"Static pages created: {created}, updated: {updated}"))

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
