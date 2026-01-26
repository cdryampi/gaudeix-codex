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
from events.models import Event, EventDate, EventCategorySingleton
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
    category, _ = Category.objects.get_or_create(
        slug="events", defaults={"taxonomy": "events", "nombre": "Events"}
    )
    return category


@pytest.fixture
def events_singleton(events_category) -> EventCategorySingleton:
    """Create the events category singleton."""
    from events.models import EventCategorySingleton

    singleton, _ = EventCategorySingleton.objects.get_or_create(
        category=events_category
    )
    return singleton


@pytest.fixture
def sample_document(sample_files_path) -> DocumentFile:
    pdf_path = sample_files_path / "sample.pdf"
    if not pdf_path.exists():
        return DocumentFile.objects.create(original_name="test.pdf", size_bytes=100)
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
    if not image_path.exists():
        return ImageFile.objects.create(original_name="test.png", size_bytes=100)
    with image_path.open("rb") as source:
        return ImageFile.objects.create(
            file=File(source, name=image_path.name),
            original_name=image_path.name,
            mime_type="image/png",
            size_bytes=os.path.getsize(image_path),
        )


def test_get_events_list(media_root, events_singleton):
    event = Event.objects.create(title="Listed Event")
    EventDate.objects.create(
        event=event, start_at=timezone.now() + timezone.timedelta(days=1)
    )

    client = APIClient()
    url = reverse("event-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["title"] == "Listed Event"


def test_create_event_with_dates_api(
    media_root, events_singleton, sample_document, sample_image
):
    user = User.objects.create_user(username="creator", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)

    url = reverse("event-list")
    start1 = timezone.now().replace(microsecond=0) + timezone.timedelta(days=3)
    start2 = start1 + timezone.timedelta(days=1)

    data = {
        "title": "API Multi-date Event",
        "dates": [
            {"start_at": start1.isoformat()},
            {"start_at": start2.isoformat()},
        ],
        "category_id": events_singleton.category.id,
    }

    response = client.post(url, data, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert Event.objects.count() == 1
    event = Event.objects.first()
    assert event.dates.count() == 2
    assert event.start_at == start1


def test_update_event_dates_api(media_root, events_singleton):
    user = User.objects.create_user(username="editor", password="pass123")
    event = Event.objects.create(title="Old")
    d1 = EventDate.objects.create(
        event=event, start_at=timezone.now() + timezone.timedelta(days=1)
    )

    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("event-detail", kwargs={"pk": event.pk})

    new_start = timezone.now().replace(microsecond=0) + timezone.timedelta(days=5)
    data = {"title": "Updated", "dates": [{"start_at": new_start.isoformat()}]}

    response = client.patch(url, data, format="json")

    assert response.status_code == status.HTTP_200_OK
    event.refresh_from_db()
    assert event.dates.count() == 1
    assert event.start_at == new_start


def test_create_event_with_multiple_dates_api(events_singleton):
    user = User.objects.create_user(username="editor_api", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)

    url = reverse("event-list")

    start1 = timezone.now().replace(microsecond=0) + timezone.timedelta(days=1)
    end1 = start1 + timezone.timedelta(hours=2)

    start2 = start1 + timezone.timedelta(days=7)
    end2 = end1 + timezone.timedelta(days=7)

    data = {
        "title": "Yoga Class",
        "dates": [
            {"start_at": start1.isoformat(), "end_at": end1.isoformat()},
            {"start_at": start2.isoformat(), "end_at": end2.isoformat()},
        ],
        "translations": {"en": {"title": "Yoga Class"}},
    }

    response = client.post(url, data, format="json")

    assert response.status_code == status.HTTP_201_CREATED, response.data

    event = Event.objects.get(pk=response.data["id"])
    assert event.dates.count() == 2
    assert event.start_at == start1


def test_update_event_dates_api_v2(events_singleton):
    user = User.objects.create_user(username="editor_api_v2", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)

    start = timezone.now()
    event = Event.objects.create(title="Concert")
    EventDate.objects.create(event=event, start_at=start)

    url = reverse("event-detail", kwargs={"pk": event.pk})

    # Replace dates with new set
    new_start = timezone.now().replace(microsecond=0) + timezone.timedelta(days=5)
    data = {
        "title": "Concert Rescheduled",
        "dates": [{"start_at": new_start.isoformat()}],
    }

    response = client.patch(url, data, format="json")

    assert response.status_code == status.HTTP_200_OK
    event.refresh_from_db()
    assert event.dates.count() == 1
    assert event.start_at == new_start


def test_occurrences_endpoint(events_singleton):
    event = Event.objects.create(title="Occurrences Test")
    d1 = EventDate.objects.create(
        event=event, start_at=timezone.now() + timezone.timedelta(days=1)
    )
    d2 = EventDate.objects.create(
        event=event, start_at=timezone.now() + timezone.timedelta(days=2)
    )

    client = APIClient()
    url = reverse("event-occurrences", kwargs={"pk": event.pk})
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    # Should return list of EventDates
    assert len(response.data) == 2
    assert response.data[0]["start_at"]
