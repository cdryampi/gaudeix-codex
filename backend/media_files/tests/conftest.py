from __future__ import annotations

from io import BytesIO

import pytest
from django.core.files.storage import FileSystemStorage, default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient


@pytest.fixture
def media_storage(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    settings.DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
    default_storage._wrapped = FileSystemStorage(location=str(tmp_path))  # type: ignore[attr-defined]
    yield tmp_path
    default_storage._wrapped = None  # type: ignore[attr-defined]


def make_test_image(name: str = "test.jpg", size=(400, 400), color=(255, 0, 0)):
    image = Image.new("RGB", size, color=color)
    buffer = BytesIO()
    image.save(buffer, format="JPEG")
    buffer.seek(0)
    return SimpleUploadedFile(name, buffer.read(), content_type="image/jpeg")


def make_test_document(name: str = "test.pdf", content: bytes | None = None):
    payload = content if content is not None else b"example document"
    return SimpleUploadedFile(name, payload, content_type="application/pdf")


@pytest.fixture
def api_client():
    return APIClient()
