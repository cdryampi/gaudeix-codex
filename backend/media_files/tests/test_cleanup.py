from __future__ import annotations

import os

import pytest
from django.core.files.storage import default_storage

from media_files.serializers import DocumentFileSerializer, ImageFileSerializer

from .conftest import make_test_document, make_test_image


def _path_exists(path: str) -> bool:
    if not path:
        return False
    try:
        return default_storage.exists(path)
    except Exception:
        return os.path.exists(path)


@pytest.mark.django_db
def test_image_files_clean_up_variants(media_storage):
    serializer = ImageFileSerializer(data={"file": make_test_image(size=(800, 600))})
    assert serializer.is_valid(), serializer.errors
    instance = serializer.save()
    instance.refresh_from_db()

    stored_paths = [
        instance.file.name,
        instance.variant_thumbnail,
        instance.variant_medium,
        instance.variant_large,
    ]
    for path in stored_paths:
        assert _path_exists(path)

    instance.delete()

    for path in stored_paths:
        assert not _path_exists(path)


@pytest.mark.django_db
def test_document_file_removed_from_storage(media_storage):
    serializer = DocumentFileSerializer(data={"file": make_test_document()})
    assert serializer.is_valid(), serializer.errors
    instance = serializer.save()
    instance.refresh_from_db()

    stored_path = instance.file.name
    assert _path_exists(stored_path)

    instance.delete()

    assert not _path_exists(stored_path)
