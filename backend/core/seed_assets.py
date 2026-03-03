from __future__ import annotations

from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
SEED_ASSETS_ROOT = BACKEND_ROOT / "seed_assets"


def resolve_seed_asset_dir(
    *,
    domain: str,
    asset_type: str,
    legacy_dir: Path | None,
    warning_writer,
) -> Path:
    """Resolve seed assets directory with legacy fallback and deprecation warning."""
    canonical_dir = SEED_ASSETS_ROOT / domain / asset_type
    if canonical_dir.exists():
        return canonical_dir

    if legacy_dir and legacy_dir.exists():
        warning_writer(
            f"DEPRECATED seed assets path in use: '{legacy_dir}'. "
            f"Move assets to '{canonical_dir}'."
        )
        return legacy_dir

    warning_writer(f"Seed assets directory not found: '{canonical_dir}'.")
    return canonical_dir

