from __future__ import annotations

import pytest
from django.urls import reverse
from rest_framework import status

from .conftest import make_test_document, make_test_image


@pytest.mark.django_db
def test_create_image_file_via_api(api_client, media_storage):
    url = "/api/v1/media/images/"
    response = api_client.post(
        url,
        data={"file": make_test_image()},
        format="multipart",
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["original_name"].endswith("test.jpg")
    assert data["size_bytes"] > 0


@pytest.mark.django_db
def test_create_document_file_via_api(api_client, media_storage):
    url = "/api/v1/media/documents/"
    response = api_client.post(
        url,
        data={"file": make_test_document()},
        format="multipart",
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["original_name"].endswith("test.pdf")


@pytest.mark.django_db
def test_reject_invalid_image_extension(api_client, media_storage):
    url = "/api/v1/media/images/"
    response = api_client.post(
        url,
        data={"file": make_test_image(name="invalid.bmp")},
        format="multipart",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "file" in response.json()


@pytest.mark.django_db
def test_reject_large_document(api_client, media_storage):
    url = "/api/v1/media/documents/"
    big_content = b"a" * (11 * 1024 * 1024)
    response = api_client.post(
        url,
        data={"file": make_test_document(content=big_content)},
        format="multipart",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "file" in response.json()
