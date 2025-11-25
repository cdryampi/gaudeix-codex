from io import BytesIO

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from media_files.models import DocumentFile, ImageFile

pytestmark = pytest.mark.django_db


def test_image_upload(media_storage):
    test_file = create_test_image()

    image_file = ImageFile.objects.create(
        file=test_file,
        original_name="test_image.jpg",
        mime_type="image/jpeg",
        size_bytes=test_file.size,
    )

    assert image_file.pk
    assert image_file.file.name


def test_document_upload(media_storage):
    test_file = create_test_document()

    doc_file = DocumentFile.objects.create(
        file=test_file,
        original_name="test_document.txt",
        mime_type="text/plain",
        size_bytes=test_file.size,
    )

    assert doc_file.pk
    assert doc_file.file.name


def create_test_image():
    img = Image.new("RGB", (800, 600), color="blue")
    buffer = BytesIO()
    img.save(buffer, format="JPEG")
    buffer.seek(0)
    return SimpleUploadedFile(
        "test_image.jpg",
        buffer.read(),
        content_type="image/jpeg",
    )


def create_test_document():
    content = b"Este es un documento de prueba.\nLinea 2\nLinea 3"
    return SimpleUploadedFile(
        "test_document.txt",
        content,
        content_type="text/plain",
    )
