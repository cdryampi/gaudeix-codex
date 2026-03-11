from __future__ import annotations

from pathlib import Path

from core import seed_assets


def test_resolve_seed_asset_dir_uses_canonical_when_it_has_files(monkeypatch, tmp_path):
    canonical_root = tmp_path / "seed_assets"
    canonical_dir = canonical_root / "media_files" / "images"
    canonical_dir.mkdir(parents=True)
    (canonical_dir / "example.png").write_bytes(b"png")

    legacy_dir = tmp_path / "legacy" / "images"
    legacy_dir.mkdir(parents=True)
    (legacy_dir / "legacy.png").write_bytes(b"png")

    monkeypatch.setattr(seed_assets, "SEED_ASSETS_ROOT", canonical_root)

    warnings: list[str] = []
    resolved = seed_assets.resolve_seed_asset_dir(
        domain="media_files",
        asset_type="images",
        legacy_dir=legacy_dir,
        warning_writer=warnings.append,
    )

    assert resolved == canonical_dir
    assert warnings == []


def test_resolve_seed_asset_dir_falls_back_to_legacy_when_canonical_only_has_gitkeep(
    monkeypatch, tmp_path
):
    canonical_root = tmp_path / "seed_assets"
    canonical_dir = canonical_root / "media_files" / "images"
    canonical_dir.mkdir(parents=True)
    (canonical_dir / ".gitkeep").write_text("", encoding="utf-8")

    legacy_dir = tmp_path / "legacy" / "images"
    legacy_dir.mkdir(parents=True)
    (legacy_dir / "legacy.png").write_bytes(b"png")

    monkeypatch.setattr(seed_assets, "SEED_ASSETS_ROOT", canonical_root)

    warnings: list[str] = []
    resolved = seed_assets.resolve_seed_asset_dir(
        domain="media_files",
        asset_type="images",
        legacy_dir=legacy_dir,
        warning_writer=warnings.append,
    )

    assert resolved == legacy_dir
    assert any("is empty" in warning for warning in warnings)
