from __future__ import annotations

import mimetypes
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction

from media_files.models import DocumentFile, ImageFile


class Command(BaseCommand):
    help = "Seed example records for the media_files app."

    assets_subdirs = {
        "images": ImageFile,
        "documents": DocumentFile,
    }

    def handle(self, *args, **options):
        with transaction.atomic():
            self._clear_data()
            self._seed_assets()

    @property
    def assets_root(self) -> Path:
        return Path(__file__).resolve().parents[2] / "seed_assets"

    def _clear_data(self) -> None:
        """Remove existing records and rely on signals to clear files."""
        image_count = ImageFile.objects.count()
        doc_count = DocumentFile.objects.count()
        ImageFile.objects.all().delete()
        DocumentFile.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS(
                f"Removed {image_count} image files and {doc_count} document files."
            )
        )

    def _seed_assets(self) -> None:
        for subdir, model in self.assets_subdirs.items():
            directory = self.assets_root / subdir
            if not directory.exists():
                self.stdout.write(
                    self.style.WARNING(
                        f"Seed directory '{directory}' not found. Skipping {subdir}."
                    )
                )
                continue

            files = sorted(p for p in directory.iterdir() if p.is_file())
            if not files:
                self.stdout.write(
                    self.style.WARNING(
                        f"No files found inside '{directory}'. Skipping {subdir}."
                    )
                )
                continue

            for path in files:
                self._create_record(model, path)

    def _create_record(self, model, path: Path) -> None:
        mime_type, _ = mimetypes.guess_type(path.name)
        with path.open("rb") as source:
            file = File(source, name=path.name)
            instance = model.objects.create(
                file=file,
                original_name=path.name,
                mime_type=mime_type or "",
                size_bytes=path.stat().st_size,
            )
        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {model.__name__} '{instance.original_name}' from {path.name}."
            )
        )
