import os
from pathlib import Path

import pytest
from django.contrib.auth import get_user_model
from django.core.files import File
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category
from media_files.models import DocumentFile, ImageFile

User = get_user_model()

pytestmark = pytest.mark.django_db


@pytest.fixture
def auth_client():
    user = User.objects.create_user(username="tester", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def media_root(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    return tmp_path


@pytest.fixture
def sample_files_path() -> Path:
    return Path(__file__).resolve().parents[2] / "events" / "tests" / "files"


@pytest.fixture
def sample_document(sample_files_path) -> DocumentFile:
    pdf_path = sample_files_path / "sample.pdf"
    with pdf_path.open("rb") as source:
        return DocumentFile.objects.create(
            file=File(source, name=pdf_path.name),
            original_name=pdf_path.name,
            mime_type="application/pdf",
            size_bytes=os.path.getsize(pdf_path),
        )


@pytest.fixture
def sample_image(sample_files_path) -> ImageFile:
    image_path = sample_files_path / "sample.png"
    with image_path.open("rb") as source:
        return ImageFile.objects.create(
            file=File(source, name=image_path.name),
            original_name=image_path.name,
            mime_type="image/png",
            size_bytes=os.path.getsize(image_path),
        )


def test_list_and_filter_categories():
    Category.objects.create(slug="events", nombre="Events", taxonomy="template")
    Category.objects.create(slug="places", nombre="Places", taxonomy="template")
    Category.objects.create(slug="other", nombre="Other", taxonomy="misc")

    client = APIClient()
    url = reverse("category-list")

    resp_all = client.get(url)
    assert resp_all.status_code == status.HTTP_200_OK
    assert len(resp_all.data) == 3

    resp_taxonomy = client.get(url, {"taxonomy": "template"})
    assert len(resp_taxonomy.data) == 2

    resp_slug = client.get(url, {"slug": "places"})
    assert len(resp_slug.data) == 1
    assert resp_slug.data[0]["slug"] == "places"


def test_create_update_delete_category(auth_client):
    url = reverse("category-list")
    payload = {
        "slug": "beach",
        "taxonomy": "template",
        "icon": "umbrella",
        "nombre": "Beach",
        "descripcion": "Sun and sand",
        "translations": {
            "es": {"nombre": "Playa", "descripcion": "Sol y arena"},
            "ca": {"nombre": "Platja", "descripcion": "Sol i sorra"},
        },
    }

    resp_create = auth_client.post(url, payload, format="json")
    assert resp_create.status_code == status.HTTP_201_CREATED
    category_id = resp_create.data["id"]
    assert resp_create.data["icon"] == "umbrella"

    detail_url = reverse("category-detail", kwargs={"pk": category_id})
    resp_patch = auth_client.patch(detail_url, {"nombre": "Beach Updated", "icon": "flag"}, format="json")
    assert resp_patch.status_code == status.HTTP_200_OK
    assert resp_patch.data["nombre"] == "Beach Updated"
    assert resp_patch.data["icon"] == "flag"

    resp_delete = auth_client.delete(detail_url)
    assert resp_delete.status_code == status.HTTP_204_NO_CONTENT
    assert Category.objects.count() == 0


def test_create_category_with_parent_and_filter(auth_client):
    root = Category.objects.create(slug="root", nombre="Root", taxonomy="template")
    url = reverse("category-list")
    payload = {
        "slug": "child",
        "taxonomy": "template",
        "nombre": "Child",
        "parent": root.id,
    }
    resp_create = auth_client.post(url, payload, format="json")
    assert resp_create.status_code == status.HTTP_201_CREATED
    assert resp_create.data["parent"] == root.id

    # Filter by parent
    resp_filter = auth_client.get(url, {"parent": root.id})
    assert resp_filter.status_code == status.HTTP_200_OK
    assert len(resp_filter.data) == 1
    assert resp_filter.data[0]["slug"] == "child"

    # Parent cannot be self
    detail_url = reverse("category-detail", kwargs={"pk": resp_create.data["id"]})
    resp_invalid = auth_client.patch(detail_url, {"parent": resp_create.data["id"]}, format="json")
    assert resp_invalid.status_code == status.HTTP_400_BAD_REQUEST


def test_create_category_with_media_and_attachments(
    auth_client, media_root, sample_image, sample_document
):
    url = reverse("category-list")
    payload = {
        "slug": "heritage",
        "taxonomy": "template",
        "nombre": "Heritage",
        "descripcion": "Historic places",
        "is_published": False,
        "featured_media_id": sample_image.id,
        "attachments_ids": [sample_document.id],
    }

    resp_create = auth_client.post(url, payload, format="json")
    assert resp_create.status_code == status.HTTP_201_CREATED
    assert resp_create.data["is_published"] is False
    assert resp_create.data["featured_media"]["id"] == sample_image.id
    assert len(resp_create.data["attachments"]) == 1
    assert resp_create.data["attachments"][0]["id"] == sample_document.id
    assert "featured_media_id" not in resp_create.data
    assert "attachments_ids" not in resp_create.data

    category = Category.objects.get(pk=resp_create.data["id"])
    assert category.featured_media_id == sample_image.id
    assert list(category.attachments.values_list("id", flat=True)) == [sample_document.id]


def test_update_category_media_and_translations(
    auth_client, media_root, sample_image, sample_document
):
    category = Category.objects.create(slug="culture", nombre="Culture", taxonomy="template")
    url = reverse("category-detail", kwargs={"pk": category.pk})
    payload = {
        "featured_media_id": sample_image.id,
        "attachments_ids": [sample_document.id],
        "translations": {"es": {"nombre": "Cultura", "descripcion": "Espacios culturales"}},
    }

    resp_patch = auth_client.patch(url, payload, format="json")
    assert resp_patch.status_code == status.HTTP_200_OK
    category.refresh_from_db()
    assert category.featured_media_id == sample_image.id
    assert list(category.attachments.values_list("id", flat=True)) == [sample_document.id]
    category.set_current_language("es")
    assert category.nombre == "Cultura"
    assert category.descripcion == "Espacios culturales"


def test_auto_translate_success(auth_client, monkeypatch):
    category = Category.objects.create(slug="museum", nombre="Museu", taxonomy="template")

    def fake_translate_text(text, source_lang, target_lang, log_translation=True):
        return f"{text}-{target_lang}"

    class FakeTranslationError(Exception):
        pass

    import sys
    import types

    fake_module = types.SimpleNamespace(translate_text=fake_translate_text, TranslationError=FakeTranslationError)
    monkeypatch.setitem(sys.modules, "llm_translations.utils", fake_module)

    url = reverse("category-auto-translate", kwargs={"pk": category.pk})
    resp = auth_client.post(url, {"source_lang": "ca", "target_langs": ["es", "en"]}, format="json")

    assert resp.status_code == status.HTTP_200_OK
    category.refresh_from_db()
    category.set_current_language("es")
    assert category.nombre == "Museu-es"
    category.set_current_language("en")
    assert category.nombre == "Museu-en"


def test_auto_translate_missing_content(auth_client):
    category = Category.objects.create(slug="empty", nombre="", taxonomy="template")

    url = reverse("category-auto-translate", kwargs={"pk": category.pk})
    resp = auth_client.post(url, {"source_lang": "ca"}, format="json")

    assert resp.status_code == status.HTTP_400_BAD_REQUEST
