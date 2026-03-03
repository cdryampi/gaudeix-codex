from __future__ import annotations

import json
import mimetypes
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.seed_utils import find_duplicate_manifest_paths
from media_files.models import DocumentFile, ImageFile


class Command(BaseCommand):
    help = "Seed example records for the media_files app."

    def add_arguments(self, parser):
        parser.add_argument(
            "--verbose-order",
            action="store_true",
            help="Show processing order for manifest entries.",
        )

    def handle(self, *args, **options):
        self.verbose_order = options.get("verbose_order", False)
        with transaction.atomic():
            self._clear_data()
            manifest = self._load_manifest()
            self._seed_assets(manifest)

    @property
    def assets_root(self) -> Path:
        return resolve_seed_asset_dir(
            domain="media_files",
            asset_type="images",
            legacy_dir=Path(__file__).resolve().parents[2] / "seed_assets" / "images",
            warning_writer=lambda msg: self.stdout.write(self.style.WARNING(msg)),
        ).parent

    @property
    def seed_manifest_path(self) -> Path:
        return Path(__file__).resolve().parents[2] / "seed" / "media_files.json"

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

    def _load_manifest(self) -> dict:
        try:
            data = json.loads(self.seed_manifest_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {self.seed_manifest_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {self.seed_manifest_path}: {exc}") from exc

        if not isinstance(data, dict):
            raise CommandError(f"Expected a JSON object in {self.seed_manifest_path}")
        return data

    def _seed_assets(self, manifest: dict) -> None:
        if not self.assets_root.exists():
            self.stdout.write(
                self.style.WARNING(
                    f"Seed assets directory '{self.assets_root}' not found. Skipping."
                )
            )
            return

        entries_by_model: list[tuple[type, list[dict]]] = [
            (ImageFile, manifest.get("images", []) or []),
            (DocumentFile, manifest.get("documents", []) or []),
        ]
        for model, entries in entries_by_model:
            if not entries:
                continue
            if not isinstance(entries, list):
                self.stdout.write(
                    self.style.WARNING(
                        f"Invalid entries for {model.__name__} in {self.seed_manifest_path}. Skipping."
                    )
                )
                continue

            duplicate_paths = find_duplicate_manifest_paths(entries)
            if duplicate_paths:
                duplicates = ", ".join(duplicate_paths)
                raise CommandError(
                    f"Duplicate path entries for {model.__name__} in {self.seed_manifest_path}: {duplicates}"
                )

            for index, entry in enumerate(entries, start=1):
                relative_path = entry.get("path") if isinstance(entry, dict) else None
                if not relative_path:
                    continue

                if self.verbose_order:
                    self.stdout.write(
                        f"[{model.__name__}] Processing #{index}: {relative_path}"
                    )

                path = self.assets_root / relative_path
                if not path.exists():
                    self.stdout.write(
                        self.style.WARNING(f"Seed file '{path}' not found. Skipping.")
                    )
                    continue

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
