import os

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from media_files.models import DocumentFile, ImageFile

pytestmark = pytest.mark.django_db


def test_image_deletion(media_storage):
    """Ensure image file and variants are cleaned up via signals."""
    image_file = _create_test_image()

    # Create record
    image = ImageFile.objects.create(
        file=image_file,
        original_name="test_delete.jpg",
        mime_type="image/jpeg",
        size_bytes=image_file.size,
    )
    original_path = image.file.path

    # Delete record
    image_id = image.id
    image.delete()

    assert not os.path.exists(original_path)
    assert ImageFile.objects.filter(id=image_id).exists() is False


def test_document_deletion(media_storage):
    """Ensure document file is cleaned up via signals."""
    content = b"Documento de prueba"
    test_file = SimpleUploadedFile(
        "test_delete.txt",
        content,
        content_type="text/plain",
    )

    doc = DocumentFile.objects.create(
        file=test_file,
        original_name="test_delete.txt",
        mime_type="text/plain",
        size_bytes=len(content),
    )
    original_path = doc.file.path

    doc_id = doc.id
    doc.delete()

    assert not os.path.exists(original_path)
    assert DocumentFile.objects.filter(id=doc_id).exists() is False


def _create_test_image():
    from io import BytesIO
    from PIL import Image

    img = Image.new("RGB", (100, 100), color="blue")
    buffer = BytesIO()
    img.save(buffer, format="JPEG")
    buffer.seek(0)

    return SimpleUploadedFile(
        "test_delete.jpg",
        buffer.read(),
        content_type="image/jpeg",
    )
