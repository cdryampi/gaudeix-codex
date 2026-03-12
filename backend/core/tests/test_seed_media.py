from __future__ import annotations

from io import BytesIO
from pathlib import Path

import pytest
from django.core.files.storage import default_storage
from PIL import Image

from core.seed_manifest import SeedAssetEntry
from core.seed_media import ensure_image_file, ensure_media_from_manifest
from media_files.models import DocumentFile, ImageFile


pytestmark = pytest.mark.django_db


@pytest.fixture
def media_root(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path / "media"
    settings.MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
    return settings.MEDIA_ROOT


def _write_png(path: Path, color: tuple[int, int, int]) -> None:
    buffer = BytesIO()
    Image.new("RGB", (12, 12), color=color).save(buffer, format="PNG")
    path.write_bytes(buffer.getvalue())


def test_ensure_image_file_reuses_existing_record(media_root, tmp_path):
    image_path = tmp_path / "sample.png"
    _write_png(image_path, (255, 0, 0))

    first = ensure_image_file(image_path)
    second = ensure_image_file(image_path)

    assert first.action == "created"
    assert second.action == "reused"
    assert second.instance.pk == first.instance.pk
    assert ImageFile.objects.count() == 1


def test_ensure_image_file_restores_missing_storage_without_changing_pk(media_root, tmp_path):
    image_path = tmp_path / "restorable.png"
    _write_png(image_path, (0, 0, 255))

    first = ensure_image_file(image_path).instance
    original_pk = first.pk
    default_storage.delete(first.file.name)
    default_storage.delete(first.variant_thumbnail)
    default_storage.delete(first.variant_medium)
    default_storage.delete(first.variant_large)

    restored = ensure_image_file(image_path)
    first.refresh_from_db()

    assert restored.action == "restored"
    assert restored.instance.pk == original_pk
    assert default_storage.exists(first.file.name)
    assert default_storage.exists(first.variant_thumbnail)
    assert default_storage.exists(first.variant_medium)
    assert default_storage.exists(first.variant_large)


def test_ensure_media_from_manifest_returns_deterministic_maps(media_root, tmp_path):
    image_path = tmp_path / "hero.png"
    _write_png(image_path, (0, 255, 0))
    document_path = tmp_path / "guide.pdf"
    document_path.write_bytes(b"%PDF-1.4 sample")

    entries = [
        SeedAssetEntry(
            path="images/hero.png",
            type="image",
            slug_or_key="home-hero",
            order=10,
            attach_to="featured_media",
            language=None,
            source_file=tmp_path / "manifest.yaml",
            resolved_path=image_path,
        ),
        SeedAssetEntry(
            path="documents/guide.pdf",
            type="document",
            slug_or_key="home-guide",
            order=20,
            attach_to="attachment",
            language=None,
            source_file=tmp_path / "manifest.yaml",
            resolved_path=document_path,
        ),
    ]

    index = ensure_media_from_manifest(entries)
    second_index = ensure_media_from_manifest(entries)

    assert index.images[("featured_media", "home-hero")].original_name == "hero.png"
    assert index.documents[("attachment", "home-guide")].original_name == "guide.pdf"
    assert second_index.images[("featured_media", "home-hero")].pk == index.images[("featured_media", "home-hero")].pk
    assert second_index.documents[("attachment", "home-guide")].pk == index.documents[("attachment", "home-guide")].pk
    assert ImageFile.objects.count() == 1
    assert DocumentFile.objects.count() == 1
