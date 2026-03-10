import os
from pathlib import Path

import pytest
from django.contrib.auth import get_user_model
from django.core.files import File
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category
from places.models import Beach, Place, PlaceCategorySingleton
from media_files.models import DocumentFile, ImageFile

User = get_user_model()

pytestmark = pytest.mark.django_db


@pytest.fixture
def media_root(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    return tmp_path


@pytest.fixture
def sample_files_path() -> Path:
    return Path(__file__).resolve().parent / "files"


@pytest.fixture
def places_category() -> Category:
    category = Category.objects.create(nombre="Places", slug="places")
    category.set_current_language("ca")
    category.nombre = "Llocs"
    category.save()
    category.set_current_language("es")
    category.nombre = "Lugares"
    category.save()
    return category


@pytest.fixture
def places_singleton(places_category) -> PlaceCategorySingleton:
    singleton = PlaceCategorySingleton.objects.create(category=places_category)
    return singleton


@pytest.fixture
def beaches_category() -> Category:
    return Category.objects.create(nombre="Playas", slug="beaches", taxonomy="template")


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


@pytest.fixture
def sample_image_secondary(sample_files_path) -> ImageFile:
    image_path = sample_files_path / "sample.png"
    with image_path.open("rb") as source:
        return ImageFile.objects.create(
            file=File(source, name="sample-secondary.png"),
            original_name="sample-secondary.png",
            mime_type="image/png",
            size_bytes=os.path.getsize(image_path),
        )


@pytest.fixture
def auth_client():
    user = User.objects.create_user(username="creator", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def test_get_places_list(media_root, places_singleton):
    Place.objects.create(title="Listed Place", latitude=1.0, longitude=1.0)

    client = APIClient()
    url = reverse("place-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    place_data = response.data[0]
    assert "created_at" in place_data
    assert "updated_at" in place_data
    assert "template_key" in place_data


def test_places_list_excludes_beaches(media_root, places_singleton, beaches_category):
    Place.objects.create(title="Listed Place", latitude=1.0, longitude=1.0)
    Beach.objects.create(title="Platja Gran")

    client = APIClient()
    url = reverse("place-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["title"] == "Listed Place"


def test_create_place_requires_authentication(media_root, places_singleton):
    client = APIClient()
    url = reverse("place-list")
    data = {
        "title": "Unauthorized Place",
        "latitude": 1.0,
        "longitude": 1.0,
    }

    response = client.post(url, data, format="json")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert Place.objects.count() == 0


def test_create_place_authenticated(media_root, places_singleton, sample_document, sample_image, auth_client):
    url = reverse("place-list")
    data = {
        "title": "API Place",
        "description": "Created via API",
        "location_text": "Main Street",
        "latitude": 1.0,
        "longitude": 2.0,
        "translations": {
            "es": {"title": "Lugar API", "description": "Creado via API"},
            "ca": {"title": "Lloc API", "description": "Creat via API"},
        },
        "featured_media": sample_image.id,
        "attachments": [sample_document.id],
    }

    response = auth_client.post(url, data, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert Place.objects.count() == 1
    place = Place.objects.first()
    assert place.slug
    assert place.featured_media == sample_image
    assert place.attachments.count() == 1


def test_retrieve_place_detail(media_root, places_singleton, sample_document, sample_image):
    place = Place.objects.create(
        title="Detail Place",
        description="Detail description",
        latitude=1.0,
        longitude=2.0,
        featured_media=sample_image,
    )
    place.attachments.add(sample_document)

    client = APIClient()
    url = reverse("place-detail", kwargs={"slug": place.slug})
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == place.id
    assert response.data["title"] == "Detail Place"
    assert response.data["featured_media"]["id"] == sample_image.id
    assert len(response.data["attachments"]) == 1


def test_update_place_authenticated(media_root, places_singleton, auth_client):
    place = Place.objects.create(title="Old Title", latitude=1.0, longitude=1.0)

    url = reverse("place-detail", kwargs={"slug": place.slug})
    data = {"title": "Updated Title", "is_published": False}

    response = auth_client.patch(url, data, format="json")

    assert response.status_code == status.HTTP_200_OK
    place.refresh_from_db()
    assert place.safe_translation_getter("title", any_language=True) == "Updated Title"
    assert place.is_published is False


def test_delete_place_authenticated(media_root, places_singleton, auth_client):
    place = Place.objects.create(title="To Delete", latitude=1.0, longitude=1.0)

    url = reverse("place-detail", kwargs={"slug": place.slug})
    response = auth_client.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Place.objects.count() == 0


def test_filter_by_is_published(media_root, places_singleton):
    Place.objects.create(title="Published", is_published=True, latitude=1.0, longitude=1.0)
    Place.objects.create(title="Draft", is_published=False, latitude=1.0, longitude=1.0)

    client = APIClient()
    url = reverse("place-list")

    response_true = client.get(url, {"is_published": "true"})
    response_false = client.get(url, {"is_published": "false"})

    assert len(response_true.data) == 1
    assert response_true.data[0]["title"] == "Published"
    assert len(response_false.data) == 1
    assert response_false.data[0]["title"] == "Draft"


def test_filter_by_bbox(media_root, places_singleton):
    Place.objects.create(title="Inside", latitude=10.0, longitude=10.0)
    Place.objects.create(title="Outside", latitude=50.0, longitude=50.0)

    client = APIClient()
    url = reverse("place-list")
    response = client.get(
        url,
        {
            "lat_min": 0,
            "lat_max": 20,
            "lng_min": 0,
            "lng_max": 20,
        },
    )

    assert len(response.data) == 1
    assert response.data[0]["title"] == "Inside"


def test_filter_by_category_slug(media_root, places_singleton):
    cat_rest = Category.objects.create(slug="restaurant", nombre="Restaurant")
    cat_hotel = Category.objects.create(slug="hotel", nombre="Hotel")
    Place.objects.create(title="Food", latitude=1.0, longitude=1.0, category=cat_rest)
    Place.objects.create(title="Sleep", latitude=2.0, longitude=2.0, category=cat_hotel)

    client = APIClient()
    url = reverse("place-list")
    response = client.get(url, {"category": "restaurant"})

    assert len(response.data) == 1
    assert response.data[0]["title"] == "Food"
    assert response.data[0]["category"] == cat_rest.id


def test_filter_by_near(media_root, places_singleton):
    near_place = Place.objects.create(title="Near", latitude=10.0, longitude=10.0)
    Place.objects.create(title="Far", latitude=50.0, longitude=50.0)

    client = APIClient()
    url = reverse("place-list")
    response = client.get(url, {"near": "10,10", "radius_km": "5"})

    assert len(response.data) == 1
    assert response.data[0]["title"] == "Near"
    assert response.data[0]["id"] == near_place.id


def test_auto_translate_success(media_root, places_singleton, auth_client, monkeypatch):
    place = Place.objects.create(title="Casa", description="Bonita casa", latitude=1.0, longitude=1.0)

    def fake_translate_text(text, source_lang, target_lang, log_translation=True):
        return f"{text}-{target_lang}"

    class FakeTranslationError(Exception):
        pass

    import sys
    import types

    fake_module = types.SimpleNamespace(translate_text=fake_translate_text, TranslationError=FakeTranslationError)
    monkeypatch.setitem(sys.modules, "llm_translations.utils", fake_module)

    url = reverse("place-auto-translate", kwargs={"slug": place.slug})
    response = auth_client.post(url, {"source_lang": "ca", "target_langs": ["en"]}, format="json")

    assert response.status_code == status.HTTP_200_OK
    place.set_current_language("en")
    place.refresh_from_db()
    assert place.title == "Casa-en"


def test_auto_translate_missing_content(media_root, places_singleton, auth_client):
    place = Place.objects.create(title="", latitude=1.0, longitude=1.0)

    url = reverse("place-auto-translate", kwargs={"slug": place.slug})
    response = auth_client.post(url, {"source_lang": "es"}, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_get_beaches_list(media_root, places_singleton, beaches_category):
    Beach.objects.create(title="Platja Gran")

    client = APIClient()
    url = reverse("beach-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["template_key"] == "beaches"


def test_create_beach_authenticated(
    media_root, places_singleton, beaches_category, sample_image, auth_client
):
    url = reverse("beach-list")
    data = {
        "title": "Platja Nova",
        "description": "Ideal per families",
        "beach_type": "urban",
        "environment_summary": "Passeig maritim i sorra ampla",
        "recommended_for": ["families", "sunset"],
        "length_m": 450,
        "access_notes": "Acces des del passeig",
        "parking_info": "Aparcament a 5 minuts",
        "public_transport_info": "Bus interurbÃ ",
        "services": {"showers": True, "toilets": True},
        "accessibility_features": {"accessible_access": True},
        "gallery_ids": [sample_image.id],
        "latitude": 1.0,
        "longitude": 2.0,
    }

    response = auth_client.post(url, data, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    beach = Beach.objects.get()
    assert beach.category == beaches_category
    assert beach.gallery.count() == 1
    assert beach.services["showers"] is True


def test_beach_requires_authentication(media_root, places_singleton, beaches_category):
    client = APIClient()
    url = reverse("beach-list")

    response = client.post(url, {"title": "Platja"}, format="json")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_beach_detail_returns_gallery(
    media_root, places_singleton, beaches_category, sample_image
):
    beach = Beach.objects.create(title="Platja amb Fotos")
    beach.gallery.add(sample_image)

    client = APIClient()
    url = reverse("beach-detail", kwargs={"slug": beach.slug})
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["gallery"][0]["id"] == sample_image.id


def test_create_beach_rejects_invalid_recommended_for(
    media_root, places_singleton, beaches_category, auth_client
):
    url = reverse("beach-list")

    response = auth_client.post(
        url,
        {
            "title": "Platja Invàlida",
            "beach_type": "urban",
            "recommended_for": ["families", "invalid-option"],
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "recommended_for" in response.data


def test_update_beach_replaces_gallery_and_flags(
    media_root,
    places_singleton,
    beaches_category,
    auth_client,
    sample_image,
    sample_image_secondary,
):
    beach = Beach.objects.create(
        title="Platja Editable",
        services={"showers": True},
        recommended_for=["families"],
    )
    beach.gallery.add(sample_image)

    url = reverse("beach-detail", kwargs={"slug": beach.slug})
    response = auth_client.patch(
        url,
        {
            "gallery_ids": [sample_image_secondary.id],
            "services": {"beach_bar": True},
            "recommended_for": ["sunset"],
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    beach.refresh_from_db()
    assert list(beach.gallery.values_list("id", flat=True)) == [sample_image_secondary.id]
    assert beach.services == {"beach_bar": True}
    assert beach.recommended_for == ["sunset"]
