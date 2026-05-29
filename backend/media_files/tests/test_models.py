from __future__ import annotations

import pytest
from django.test import RequestFactory

from media_files.serializers import DocumentFileSerializer, ImageFileSerializer

from .conftest import make_test_document, make_test_image


@pytest.mark.django_db
def test_image_file_stores_metadata(media_storage):
    serializer = ImageFileSerializer(data={"file": make_test_image()})
    assert serializer.is_valid(), serializer.errors
    instance = serializer.save()
    instance.refresh_from_db()

    assert instance.original_name.endswith("test.jpg")
    assert instance.mime_type.startswith("image/")
    assert instance.size_bytes > 0


@pytest.mark.django_db
def test_document_file_stores_metadata(media_storage):
    serializer = DocumentFileSerializer(data={"file": make_test_document()})
    assert serializer.is_valid(), serializer.errors
    instance = serializer.save()
    instance.refresh_from_db()

    assert instance.original_name.endswith("test.pdf")
    assert instance.mime_type in {"application/pdf", ""}
    assert instance.size_bytes == instance.file.size


@pytest.mark.django_db
def test_image_serializer_returns_absolute_media_urls(media_storage):
    serializer = ImageFileSerializer(data={"file": make_test_image()})
    assert serializer.is_valid(), serializer.errors
    instance = serializer.save()

    request = RequestFactory().get("/")
    data = ImageFileSerializer(instance, context={"request": request}).data

    assert data["file"].startswith("http://testserver/media/")
    assert data["variant_thumbnail"].startswith("http://testserver/media/")
    assert data["variant_medium"].startswith("http://testserver/media/")
    assert data["variant_large"].startswith("http://testserver/media/")
    assert data["thumbnail_url"].startswith("http://testserver/media/")


@pytest.mark.django_db
def test_document_serializer_returns_absolute_file_url(media_storage):
    serializer = DocumentFileSerializer(data={"file": make_test_document()})
    assert serializer.is_valid(), serializer.errors
    instance = serializer.save()

    request = RequestFactory().get("/")
    data = DocumentFileSerializer(instance, context={"request": request}).data

    assert data["file"].startswith("http://testserver/media/")
