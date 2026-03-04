from __future__ import annotations

import json
from io import BytesIO
from pathlib import Path

import pytest
from django.core.management import CommandError, call_command
from PIL import Image

from media_files.management.commands.seed_media_files import Command


def _patch_seed_paths(monkeypatch: pytest.MonkeyPatch, assets_root: Path, manifest_path: Path) -> None:
    monkeypatch.setattr(Command, "assets_root", property(lambda self: assets_root))
    monkeypatch.setattr(
        Command,
        "seed_manifest_path",
        property(lambda self: manifest_path),
    )


def _build_png_bytes(color: tuple[int, int, int]) -> bytes:
    image = Image.new("RGB", (8, 8), color=color)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


@pytest.mark.django_db
def test_seed_media_files_verbose_logs_stable_order(capsys, monkeypatch, tmp_path):
    assets_root = tmp_path / "seed_assets"
    images_dir = assets_root / "images"
    images_dir.mkdir(parents=True)
    (images_dir / "zeta.png").write_bytes(_build_png_bytes((255, 0, 0)))
    (images_dir / "alpha.png").write_bytes(_build_png_bytes((0, 0, 255)))

    manifest_path = tmp_path / "media_files.json"
    manifest_path.write_text(
        json.dumps(
            {
                "images": [
                    {"path": "images/zeta.png"},
                    {"path": "images/alpha.png"},
                ],
                "documents": [],
            }
        ),
        encoding="utf-8",
    )

    _patch_seed_paths(monkeypatch, assets_root, manifest_path)

    call_command("seed_media_files", "--verbose-order")
    first_output = capsys.readouterr().out

    call_command("seed_media_files", "--verbose-order")
    second_output = capsys.readouterr().out

    first_order_lines = [
        line for line in first_output.splitlines() if line.startswith("[ImageFile] Processing")
    ]
    second_order_lines = [
        line for line in second_output.splitlines() if line.startswith("[ImageFile] Processing")
    ]

    assert first_order_lines == [
        "[ImageFile] Processing #1: images/zeta.png",
        "[ImageFile] Processing #2: images/alpha.png",
    ]
    assert second_order_lines == first_order_lines


@pytest.mark.django_db
def test_seed_media_files_rejects_duplicate_manifest_paths(monkeypatch, tmp_path):
    assets_root = tmp_path / "seed_assets"
    images_dir = assets_root / "images"
    images_dir.mkdir(parents=True)
    (images_dir / "alpha.png").write_bytes(_build_png_bytes((0, 255, 0)))

    manifest_path = tmp_path / "media_files.json"
    manifest_path.write_text(
        json.dumps(
            {
                "images": [
                    {"path": "images/alpha.png"},
                    {"path": "images/alpha.png"},
                ],
                "documents": [],
            }
        ),
        encoding="utf-8",
    )

    _patch_seed_paths(monkeypatch, assets_root, manifest_path)

    with pytest.raises(CommandError, match="Duplicate path entries"):
        call_command("seed_media_files")
