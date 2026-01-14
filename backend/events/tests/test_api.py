import os
from pathlib import Path

import pytest
from django.contrib.auth import get_user_model
from django.core.files import File
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category, Tag
from events.models import Event, EventCategorySingleton
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
def events_category() -> Category:
    """Create the default events category."""
    category = Category.objects.create(
        slug="events", taxonomy="events", nombre="Events"
    )
    category.set_current_language("ca")
    category.nombre = "Esdeveniments"
    category.save()
    category.set_current_language("es")
    category.nombre = "Eventos"
    category.save()
    return category


@pytest.fixture
def events_singleton(events_category) -> EventCategorySingleton:
    """Create the events category singleton."""
    singleton = EventCategorySingleton.objects.create(category=events_category)
    return singleton


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


def test_get_events_list(media_root, events_singleton):
    Event.objects.create(
        title="Listed Event",
        start_at=timezone.now() + timezone.timedelta(days=1),
    )

    client = APIClient()
    url = reverse("event-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    # Test backward compatibility: created_at and updated_at in response
    event_data = response.data[0]
    assert "created_at" in event_data
    assert "updated_at" in event_data


def test_create_event_requires_authentication(media_root, events_singleton):
    client = APIClient()
    url = reverse("event-list")
    data = {
        "title": "Unauthorized Create",
        "start_at": (timezone.now() + timezone.timedelta(days=2)).isoformat(),
    }

    response = client.post(url, data, format="json")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert Event.objects.count() == 0


def test_create_event_authenticated(
    media_root, events_singleton, sample_document, sample_image
):
    user = User.objects.create_user(username="creator", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)

    child_category = Category.objects.create(
        slug="cultura",
        taxonomy="events",
        parent=events_singleton.category,
        nombre="Cultura",
    )
    tag_music = Tag.objects.create(slug="music", nombre="Music")
    tag_family = Tag.objects.create(slug="family", nombre="Family")

    url = reverse("event-list")
    start = timezone.now() + timezone.timedelta(days=3)
    end = start + timezone.timedelta(hours=2)
    data = {
        "title": "API Event",
        "summary": "Short description",
        "description": "Created via API",
        "start_at": start.isoformat(),
        "end_at": end.isoformat(),
        "venue_name": "Centre Civic",
        "location_text": "Plaça Major",
        "is_featured": True,
        "is_free": False,
        "price_text": "10 EUR",
        "category_id": child_category.id,
        "tag_ids": [tag_music.id, tag_family.id],
        "translations": {
            "es": {
                "title": "Evento API",
                "summary": "Descripcion corta",
                "description": "Creado via API",
            },
            "ca": {
                "title": "Esdeveniment API",
                "summary": "Descripcio curta",
                "description": "Creat via API",
            },
        },
        "featured_media": sample_image.id,
        "attachments": [sample_document.id],
    }

    response = client.post(url, data, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert Event.objects.count() == 1
    event = Event.objects.first()
    assert event.slug
    assert event.safe_translation_getter("title", any_language=True) == "API Event"
    assert event.category == child_category
    assert event.tags.count() == 2
    assert event.featured_media == sample_image
    assert event.attachments.count() == 1

    assert response.data["category"] == child_category.id
    assert response.data["category_slug"] == "cultura"
    assert response.data["category_name"]
    assert len(response.data["tags"]) == 2


def test_retrieve_event_detail(
    media_root, events_singleton, sample_document, sample_image
):
    event = Event.objects.create(
        title="Detail Event",
        description="Detail description",
        start_at=timezone.now() + timezone.timedelta(days=1),
        featured_media=sample_image,
    )
    event.attachments.add(sample_document)

    client = APIClient()
    url = reverse("event-detail", kwargs={"pk": event.pk})
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == event.id
    assert response.data["title"] == "Detail Event"
    assert response.data["featured_media"]["id"] == sample_image.id
    assert len(response.data["attachments"]) == 1


def test_update_event_authenticated(media_root, events_singleton):
    user = User.objects.create_user(username="editor", password="pass123")
    event = Event.objects.create(
        title="Old Title",
        start_at=timezone.now() + timezone.timedelta(days=1),
    )
    tag = Tag.objects.create(slug="updated", nombre="Updated")

    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("event-detail", kwargs={"pk": event.pk})
    data = {
        "title": "Updated Title",
        "is_published": False,
        "is_featured": True,
        "tag_ids": [tag.id],
    }

    response = client.patch(url, data, format="json")

    assert response.status_code == status.HTTP_200_OK
    event.refresh_from_db()
    assert event.safe_translation_getter("title", any_language=True) == "Updated Title"
    assert event.is_published is False
    assert event.is_featured is True
    assert event.tags.count() == 1


def test_delete_event_authenticated(media_root, events_singleton):
    user = User.objects.create_user(username="deleter", password="pass123")
    event = Event.objects.create(
        title="To Delete",
        start_at=timezone.now() + timezone.timedelta(days=1),
    )

    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("event-detail", kwargs={"pk": event.pk})

    response = client.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Event.objects.count() == 0


def test_filter_events_by_tag_and_category(media_root, events_singleton):
    tag = Tag.objects.create(slug="music", nombre="Music")
    category = Category.objects.create(
        slug="cultura",
        taxonomy="events",
        parent=events_singleton.category,
        nombre="Cultura",
    )
    start = timezone.now() + timezone.timedelta(days=1)

    match = Event.objects.create(title="Match", start_at=start, category=category)
    match.tags.add(tag)
    Event.objects.create(title="Nope", start_at=start + timezone.timedelta(hours=1))

    client = APIClient()
    url = reverse("event-list")

    resp_tag = client.get(url, {"tag": "music"})
    assert resp_tag.status_code == status.HTTP_200_OK
    assert len(resp_tag.data) == 1

    resp_category = client.get(url, {"category": "cultura"})
    assert resp_category.status_code == status.HTTP_200_OK
    assert len(resp_category.data) == 1


def test_favorite_event_flow(media_root, events_singleton):
    user = User.objects.create_user(username="fan", password="pass123")
    event = Event.objects.create(
        title="Favorite Event",
        start_at=timezone.now() + timezone.timedelta(days=1),
    )

    client = APIClient()
    client.force_authenticate(user=user)

    favorite_url = reverse("event-favorite", kwargs={"pk": event.pk})
    response = client.post(favorite_url)

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["is_favorited"] is True
    assert response.data["favorites_count"] == 1

    detail_url = reverse("event-detail", kwargs={"pk": event.pk})
    detail_response = client.get(detail_url)

    assert detail_response.status_code == status.HTTP_200_OK
    assert detail_response.data["is_favorited"] is True
    assert detail_response.data["favorites_count"] == 1

    delete_response = client.delete(favorite_url)
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    detail_response = client.get(detail_url)
    assert detail_response.data["is_favorited"] is False
    assert detail_response.data["favorites_count"] == 0
