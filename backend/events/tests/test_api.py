import os
from pathlib import Path

import pytest
from django.contrib.auth import get_user_model
from django.core.files import File
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from events.models import Event
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


def test_get_events_list(media_root):
    Event.objects.create(
        title="Listed Event",
        start_at=timezone.now() + timezone.timedelta(days=1),
    )

    client = APIClient()
    url = reverse("event-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1


def test_create_event_requires_authentication(media_root):
    client = APIClient()
    url = reverse("event-list")
    data = {
        "title": "Unauthorized Create",
        "start_at": (timezone.now() + timezone.timedelta(days=2)).isoformat(),
    }

    response = client.post(url, data, format="json")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert Event.objects.count() == 0


def test_create_event_authenticated(media_root, sample_document, sample_image):
    user = User.objects.create_user(username="creator", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)

    url = reverse("event-list")
    start = timezone.now() + timezone.timedelta(days=3)
    end = start + timezone.timedelta(hours=2)
    data = {
        "title": "API Event",
        "description": "Created via API",
        "start_at": start.isoformat(),
        "end_at": end.isoformat(),
        "translations": {
            "es": {"title": "Evento API", "description": "Creado via API"},
            "ca": {"title": "Esdeveniment API", "description": "Creat via API"},
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
    assert event.featured_media == sample_image
    assert event.attachments.count() == 1


def test_retrieve_event_detail(media_root, sample_document, sample_image):
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


def test_update_event_authenticated(media_root):
    user = User.objects.create_user(username="editor", password="pass123")
    event = Event.objects.create(
        title="Old Title",
        start_at=timezone.now() + timezone.timedelta(days=1),
    )

    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("event-detail", kwargs={"pk": event.pk})
    data = {"title": "Updated Title", "is_published": False}

    response = client.patch(url, data, format="json")

    assert response.status_code == status.HTTP_200_OK
    event.refresh_from_db()
    assert event.safe_translation_getter("title", any_language=True) == "Updated Title"
    assert event.is_published is False


def test_delete_event_authenticated(media_root):
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
