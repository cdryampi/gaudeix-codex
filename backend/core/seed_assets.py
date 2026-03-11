from __future__ import annotations

from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
SEED_ASSETS_ROOT = BACKEND_ROOT / "seed_assets"


def _has_seed_files(path: Path) -> bool:
    return any(child.is_file() and child.name != ".gitkeep" for child in path.iterdir())


def resolve_seed_asset_dir(
    *,
    domain: str,
    asset_type: str,
    legacy_dir: Path | None,
    warning_writer,
) -> Path:
    """Resolve seed assets directory with legacy fallback and deprecation warning."""
    canonical_dir = SEED_ASSETS_ROOT / domain / asset_type
    if canonical_dir.exists() and _has_seed_files(canonical_dir):
        return canonical_dir

    if canonical_dir.exists() and legacy_dir and legacy_dir.exists():
        warning_writer(
            f"Canonical seed assets path '{canonical_dir}' is empty. "
            f"Using legacy path '{legacy_dir}' until assets are migrated."
        )
        return legacy_dir

    if legacy_dir and legacy_dir.exists():
        warning_writer(
            f"DEPRECATED seed assets path in use: '{legacy_dir}'. "
            f"Move assets to '{canonical_dir}'."
        )
        return legacy_dir

    warning_writer(f"Seed assets directory not found: '{canonical_dir}'.")
    return canonical_dir

