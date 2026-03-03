from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml
from django.core.management.base import CommandError


@dataclass(frozen=True)
class SeedAssetEntry:
    path: str
    type: str
    slug_or_key: str
    order: int
    attach_to: str
    language: str | None
    source_file: Path
    resolved_path: Path


def load_seed_asset_manifest(
    manifest_path: Path,
    assets_root: Path,
    *,
    allowed_types: set[str],
    allowed_attach_to: set[str],
) -> list[SeedAssetEntry]:
    if not manifest_path.exists():
        raise CommandError(f"Asset manifest not found: {manifest_path}")

    raw = _read_manifest(manifest_path)
    if not isinstance(raw, dict):
        raise CommandError(f"Expected object at root of manifest: {manifest_path}")

    assets = raw.get("assets")
    if not isinstance(assets, list):
        raise CommandError(f"Expected 'assets' array in manifest: {manifest_path}")

    errors: list[str] = []
    entries: list[SeedAssetEntry] = []

    for idx, asset in enumerate(assets):
        ctx = f"assets[{idx}]"
        field_errors: list[str] = []
        if not isinstance(asset, dict):
            errors.append(f"{ctx}: expected object")
            continue

        path = asset.get("path")
        media_type = asset.get("type")
        slug_or_key = asset.get("slug_or_key")
        order = asset.get("order")
        attach_to = asset.get("attach_to")
        language = asset.get("language")

        if not isinstance(path, str) or not path.strip():
            field_errors.append(f"{ctx}.path: required non-empty string")
        if not isinstance(media_type, str) or media_type not in allowed_types:
            field_errors.append(
                f"{ctx}.type: expected one of {sorted(allowed_types)}, got {media_type!r}"
            )
        if not isinstance(slug_or_key, str) or not slug_or_key.strip():
            field_errors.append(f"{ctx}.slug_or_key: required non-empty string")
        if not isinstance(order, int):
            field_errors.append(f"{ctx}.order: required integer")
        if not isinstance(attach_to, str) or attach_to not in allowed_attach_to:
            field_errors.append(
                f"{ctx}.attach_to: expected one of {sorted(allowed_attach_to)}, got {attach_to!r}"
            )
        if language is not None and not isinstance(language, str):
            field_errors.append(f"{ctx}.language: expected string or null")

        if field_errors:
            errors.extend(field_errors)
            continue

        resolved = (assets_root / path).resolve()
        if not resolved.is_file():
            errors.append(
                f"{ctx}.path: file not found '{path}' (resolved to {resolved})"
            )
            continue

        entries.append(
            SeedAssetEntry(
                path=path,
                type=media_type,
                slug_or_key=slug_or_key,
                order=order,
                attach_to=attach_to,
                language=language,
                source_file=manifest_path,
                resolved_path=resolved,
            )
        )

    if errors:
        joined = "\n - " + "\n - ".join(errors)
        raise CommandError(f"Invalid asset manifest {manifest_path}:{joined}")

    return sorted(entries, key=lambda item: (item.order, item.slug_or_key, item.attach_to))


def render_dry_run(entries: list[SeedAssetEntry], *, title: str) -> str:
    lines = [title]
    for entry in entries:
        language = f" [{entry.language}]" if entry.language else ""
        lines.append(
            f" - order={entry.order:03d} key={entry.slug_or_key} attach_to={entry.attach_to} "
            f"type={entry.type} path={entry.path}{language}"
        )
    return "\n".join(lines)


def _read_manifest(path: Path) -> Any:
    suffix = path.suffix.lower()
    try:
        content = path.read_text(encoding="utf-8")
    except OSError as exc:
        raise CommandError(f"Unable to read asset manifest {path}: {exc}") from exc

    try:
        if suffix in {".yaml", ".yml"}:
            return yaml.safe_load(content)
        return json.loads(content)
    except Exception as exc:
        raise CommandError(f"Invalid manifest format in {path}: {exc}") from exc
