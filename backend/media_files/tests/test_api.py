from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

from .conftest import make_test_document, make_test_image

User = get_user_model()


@pytest.fixture
def auth_client(api_client):
    user = User.objects.create_user(username="uploader", password="pass123")
    api_client.force_authenticate(user=user)
    return api_client


@pytest.mark.django_db
def test_create_image_file_via_api(auth_client, media_storage):
    url = "/api/v1/media/images/"
    response = auth_client.post(
        url,
        data={"file": make_test_image()},
        format="multipart",
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["original_name"].endswith("test.jpg")
    assert data["size_bytes"] > 0
    assert data["file"].startswith("http://testserver/media/")
    assert data["variant_thumbnail"] != ""
    assert data["variant_thumbnail"].startswith("http://testserver/media/")
    assert data["thumbnail_url"] != ""
    assert data["thumbnail_url"].startswith("http://testserver/media/")


@pytest.mark.django_db
def test_create_document_file_via_api(auth_client, media_storage):
    url = "/api/v1/media/documents/"
    response = auth_client.post(
        url,
        data={"file": make_test_document()},
        format="multipart",
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["original_name"].endswith("test.pdf")
    assert data["file"].startswith("http://testserver/media/")


@pytest.mark.django_db
def test_reject_invalid_image_extension(auth_client, media_storage):
    url = "/api/v1/media/images/"
    response = auth_client.post(
        url,
        data={"file": make_test_image(name="invalid.bmp")},
        format="multipart",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "file" in response.json()


@pytest.mark.django_db
def test_rename_image(auth_client, media_storage):
    create_url = "/api/v1/media/images/"
    create_resp = auth_client.post(
        create_url,
        data={"file": make_test_image()},
        format="multipart",
    )
    assert create_resp.status_code == status.HTTP_201_CREATED
    image_id = create_resp.json()["id"]

    patch_url = f"/api/v1/media/images/{image_id}/"
    patch_resp = auth_client.patch(patch_url, data={"original_name": "renamed.jpg"}, format="json")
    assert patch_resp.status_code == status.HTTP_200_OK
    assert patch_resp.json()["original_name"] == "renamed.jpg"


@pytest.mark.django_db
def test_rename_document(auth_client, media_storage):
    create_url = "/api/v1/media/documents/"
    create_resp = auth_client.post(
        create_url,
        data={"file": make_test_document()},
        format="multipart",
    )
    assert create_resp.status_code == status.HTTP_201_CREATED
    doc_id = create_resp.json()["id"]

    patch_url = f"/api/v1/media/documents/{doc_id}/"
    patch_resp = auth_client.patch(patch_url, data={"original_name": "renamed.pdf"}, format="json")
    assert patch_resp.status_code == status.HTTP_200_OK
    assert patch_resp.json()["original_name"] == "renamed.pdf"


@pytest.mark.django_db
def test_reject_large_document(auth_client, media_storage):
    url = "/api/v1/media/documents/"
    big_content = b"a" * (11 * 1024 * 1024)
    response = auth_client.post(
        url,
        data={"file": make_test_document(content=big_content)},
        format="multipart",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "file" in response.json()
