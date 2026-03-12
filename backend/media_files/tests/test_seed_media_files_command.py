from __future__ import annotations

import json
from io import BytesIO
from pathlib import Path

import pytest
from django.core.management import CommandError, call_command
from PIL import Image

from core.models import Category
from media_files.management.commands.seed_media_files import Command
from media_files.models import DocumentFile, ImageFile


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


@pytest.mark.django_db
def test_seed_media_files_rerun_preserves_existing_relationships(monkeypatch, tmp_path):
    assets_root = tmp_path / "seed_assets"
    images_dir = assets_root / "images"
    documents_dir = assets_root / "documents"
    images_dir.mkdir(parents=True)
    documents_dir.mkdir(parents=True)
    (images_dir / "alpha.png").write_bytes(_build_png_bytes((255, 255, 0)))
    (documents_dir / "guide.pdf").write_bytes(b"%PDF-1.4 guide")

    manifest_path = tmp_path / "media_files.json"
    manifest_path.write_text(
        json.dumps(
            {
                "images": [{"path": "images/alpha.png"}],
                "documents": [{"path": "documents/guide.pdf"}],
            }
        ),
        encoding="utf-8",
    )

    _patch_seed_paths(monkeypatch, assets_root, manifest_path)

    call_command("seed_media_files")
    image = ImageFile.objects.get(original_name="alpha.png")
    document = DocumentFile.objects.get(original_name="guide.pdf")
    category = Category.objects.create(
        slug="demo-category",
        nombre="Demo category",
        featured_media=image,
    )
    category.attachments.add(document)

    call_command("seed_media_files")

    category.refresh_from_db()
    assert ImageFile.objects.filter(original_name="alpha.png").count() == 1
    assert DocumentFile.objects.filter(original_name="guide.pdf").count() == 1
    assert category.featured_media_id == image.id
    assert list(category.attachments.values_list("id", flat=True)) == [document.id]
