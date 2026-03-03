from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from dataclasses import dataclass
from typing import Any

from django.apps import apps
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand
from django.db.models import Field

from media_files.models import DocumentFile, ImageFile, VideoFile

DEFAULT_LEGACY_PATH_MARKERS = (
    "/media/uploads/",
    "/legacy/uploads/",
    "/legacy/media/",
)


@dataclass
class DuplicateGroup:
    key: str
    records: list[str]


class Command(BaseCommand):
    help = (
        "Audit media assets and report: orphan assets, duplicate assets by name/content, "
        "and remaining legacy path references."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--legacy-marker",
            action="append",
            dest="legacy_markers",
            default=None,
            help=(
                "Legacy path marker to scan for. Can be passed multiple times. "
                "Defaults to common legacy upload path prefixes."
            ),
        )
        parser.add_argument(
            "--json",
            action="store_true",
            help="Print the report as JSON for scripting.",
        )

    def handle(self, *args, **options):
        legacy_markers = tuple(options.get("legacy_markers") or DEFAULT_LEGACY_PATH_MARKERS)
        report = {
            "deprecation_window_releases": getattr(
                settings, "ASSET_LEGACY_DEPRECATION_RELEASE_WINDOW", 2
            ),
            "orphan_assets": self._collect_orphan_assets(),
            "duplicates_by_name": self._collect_duplicates_by_name(),
            "duplicates_by_content": self._collect_duplicates_by_content(),
            "legacy_path_references": self._collect_legacy_references(legacy_markers),
        }

        if options.get("json"):
            self.stdout.write(json.dumps(report, indent=2, ensure_ascii=False, sort_keys=True))
            return

        self._print_human_report(report, legacy_markers)

    def _asset_models(self):
        return (ImageFile, DocumentFile, VideoFile)

    def _collect_orphan_assets(self) -> dict[str, list[str]]:
        result: dict[str, list[str]] = {}
        for model in self._asset_models():
            orphans: list[str] = []
            for instance in model.objects.all().only("id", "original_name"):
                if self._is_orphan(instance):
                    orphans.append(f"{instance.id}:{instance.original_name}")
            result[model.__name__] = orphans
        return result

    def _is_orphan(self, instance: Any) -> bool:
        for relation in instance._meta.related_objects:
            if relation.related_model._meta.app_label == "simple_history":
                continue
            accessor = relation.get_accessor_name()
            manager_or_object = getattr(instance, accessor)
            if relation.one_to_one:
                if manager_or_object is not None:
                    return False
                continue
            if manager_or_object.exists():
                return False
        return True

    def _collect_duplicates_by_name(self) -> dict[str, list[list[str]]]:
        output: dict[str, list[list[str]]] = {}
        for model in self._asset_models():
            by_name: dict[str, list[str]] = defaultdict(list)
            for record in model.objects.all().only("id", "original_name"):
                key = (record.original_name or "").strip().lower()
                if not key:
                    continue
                by_name[key].append(f"{record.id}:{record.original_name}")
            output[model.__name__] = [values for values in by_name.values() if len(values) > 1]
        return output

    def _collect_duplicates_by_content(self) -> dict[str, list[list[str]]]:
        output: dict[str, list[list[str]]] = {}
        for model in self._asset_models():
            by_hash: dict[str, list[str]] = defaultdict(list)
            for record in model.objects.all().only("id", "original_name", "file"):
                digest = self._sha256(record.file.name)
                if not digest:
                    continue
                by_hash[digest].append(f"{record.id}:{record.original_name}")
            output[model.__name__] = [values for values in by_hash.values() if len(values) > 1]
        return output

    def _sha256(self, path: str) -> str:
        if not path:
            return ""
        if not default_storage.exists(path):
            return ""

        digest = hashlib.sha256()
        with default_storage.open(path, "rb") as f:
            for chunk in iter(lambda: f.read(1024 * 64), b""):
                digest.update(chunk)
        return digest.hexdigest()

    def _collect_legacy_references(self, markers: tuple[str, ...]) -> dict[str, list[dict[str, Any]]]:
        result: dict[str, list[dict[str, Any]]] = {marker: [] for marker in markers}
        for model in apps.get_models():
            fields = [f for f in model._meta.get_fields() if self._is_text_like_field(f)]
            if not fields:
                continue

            field_names = [f.name for f in fields]
            for obj in model.objects.values("pk", *field_names):
                pk = obj.get("pk")
                for field_name in field_names:
                    value = obj.get(field_name)
                    if not value:
                        continue
                    value_text = self._stringify_value(value)
                    for marker in markers:
                        if marker in value_text:
                            result[marker].append(
                                {
                                    "model": f"{model._meta.app_label}.{model.__name__}",
                                    "pk": pk,
                                    "field": field_name,
                                }
                            )
        return result

    def _is_text_like_field(self, field: Field) -> bool:
        internal_type = field.get_internal_type()
        return internal_type in {"CharField", "TextField", "JSONField", "URLField"}

    def _stringify_value(self, value: Any) -> str:
        if isinstance(value, str):
            return value
        return json.dumps(value, ensure_ascii=False, sort_keys=True)

    def _print_human_report(self, report: dict[str, Any], markers: tuple[str, ...]) -> None:
        self.stdout.write(self.style.MIGRATE_HEADING("Asset audit report"))
        self.stdout.write(
            f"Legacy deprecation window: {report['deprecation_window_releases']} release(s)."
        )

        self.stdout.write(self.style.MIGRATE_HEADING("Orphan assets"))
        for model, rows in report["orphan_assets"].items():
            self.stdout.write(f"- {model}: {len(rows)}")
            for row in rows:
                self.stdout.write(f"  · {row}")

        self.stdout.write(self.style.MIGRATE_HEADING("Duplicate assets by original_name"))
        for model, groups in report["duplicates_by_name"].items():
            self.stdout.write(f"- {model}: {len(groups)} group(s)")
            for group in groups:
                self.stdout.write(f"  · {', '.join(group)}")

        self.stdout.write(self.style.MIGRATE_HEADING("Duplicate assets by content hash"))
        for model, groups in report["duplicates_by_content"].items():
            self.stdout.write(f"- {model}: {len(groups)} group(s)")
            for group in groups:
                self.stdout.write(f"  · {', '.join(group)}")

        self.stdout.write(self.style.MIGRATE_HEADING("Legacy path references"))
        for marker in markers:
            rows = report["legacy_path_references"].get(marker, [])
            self.stdout.write(f"- {marker}: {len(rows)}")
            for row in rows:
                self.stdout.write(
                    f"  · {row['model']} pk={row['pk']} field={row['field']}"
                )
