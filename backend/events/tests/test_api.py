import os
from datetime import datetime, time, timedelta
from pathlib import Path

import pytest
from django.contrib.auth import get_user_model
from django.core.files import File
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category
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
    EventDate.objects.create(
        event=event, start_at=timezone.now() + timezone.timedelta(days=1)
    )

    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("event-detail", kwargs={"slug": event.slug})

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

    url = reverse("event-detail", kwargs={"slug": event.slug})

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
    EventDate.objects.create(
        event=event, start_at=timezone.now() + timezone.timedelta(days=1)
    )
    EventDate.objects.create(
        event=event, start_at=timezone.now() + timezone.timedelta(days=2)
    )

    client = APIClient()
    url = reverse("event-occurrences", kwargs={"slug": event.slug})
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    # Should return list of EventDates
    assert len(response.data) == 2
    assert response.data[0]["start_at"]


def test_filter_has_future_sessions_uses_event_dates(events_singleton):
    now = timezone.now().replace(microsecond=0)

    future_event = Event.objects.create(title="Future sessions")
    EventDate.objects.create(
        event=future_event, start_at=now + timezone.timedelta(days=2)
    )

    past_event = Event.objects.create(title="Past sessions")
    EventDate.objects.create(
        event=past_event, start_at=now - timezone.timedelta(days=2)
    )

    client = APIClient()
    response = client.get(reverse("event-list"), {"has_future_sessions": "true"})

    assert response.status_code == status.HTTP_200_OK
    returned_titles = {item["title"] for item in response.data}
    assert "Future sessions" in returned_titles
    assert "Past sessions" not in returned_titles


def test_filter_date_matches_day_boundaries_in_timezone(events_singleton):
    tz = timezone.get_current_timezone()
    target_day = (timezone.localtime(timezone.now(), tz) + timedelta(days=4)).date()
    start_of_day = timezone.make_aware(datetime.combine(target_day, time.min), tz)

    matching_event = Event.objects.create(title="Same day session")
    EventDate.objects.create(
        event=matching_event, start_at=start_of_day + timedelta(hours=12)
    )

    outside_event = Event.objects.create(title="Different day session")
    EventDate.objects.create(
        event=outside_event, start_at=start_of_day - timedelta(minutes=1)
    )

    client = APIClient()
    response = client.get(reverse("event-list"), {"date": target_day.isoformat()})

    assert response.status_code == status.HTTP_200_OK
    returned_titles = {item["title"] for item in response.data}
    assert "Same day session" in returned_titles
    assert "Different day session" not in returned_titles


def test_filter_upcoming_with_start_from_returns_400(events_singleton):
    client = APIClient()
    response = client.get(
        reverse("event-list"),
        {
            "upcoming": "true",
            "start_from": timezone.now().date().isoformat(),
        },
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "upcoming" in str(response.data).lower()


def test_filter_start_range_uses_event_sessions(events_singleton):
    tz = timezone.get_current_timezone()
    target_day = (timezone.localtime(timezone.now(), tz) + timedelta(days=7)).date()
    start_of_day = timezone.make_aware(datetime.combine(target_day, time.min), tz)

    in_range = Event.objects.create(title="Range in")
    EventDate.objects.create(
        event=in_range, start_at=start_of_day + timedelta(hours=10)
    )

    before_range = Event.objects.create(title="Range before")
    EventDate.objects.create(
        event=before_range, start_at=start_of_day - timedelta(days=1)
    )

    after_range = Event.objects.create(title="Range after")
    EventDate.objects.create(
        event=after_range, start_at=start_of_day + timedelta(days=2)
    )

    client = APIClient()
    response = client.get(
        reverse("event-list"),
        {
            "start_from": target_day.isoformat(),
            "start_to": target_day.isoformat(),
        },
    )

    assert response.status_code == status.HTTP_200_OK
    returned_titles = {item["title"] for item in response.data}
    assert "Range in" in returned_titles
    assert "Range before" not in returned_titles
    assert "Range after" not in returned_titles


def test_filter_date_includes_day_edge_sessions_with_timezone_override(
    events_singleton,
):
    with timezone.override("Europe/Madrid"):
        current_tz = timezone.get_current_timezone()
        target_day = (
            timezone.localtime(timezone.now(), current_tz) + timedelta(days=5)
        ).date()
        day_start = timezone.make_aware(
            datetime.combine(target_day, time.min), current_tz
        )
        day_end = day_start + timedelta(days=1)

        starts_at_day_start = Event.objects.create(title="Starts at day start")
        EventDate.objects.create(event=starts_at_day_start, start_at=day_start)

        ends_day_edge = Event.objects.create(title="Ends day edge")
        EventDate.objects.create(
            event=ends_day_edge, start_at=day_end - timedelta(seconds=1)
        )

        starts_next_day = Event.objects.create(title="Starts next day")
        EventDate.objects.create(event=starts_next_day, start_at=day_end)

        previous_day = Event.objects.create(title="Previous day")
        EventDate.objects.create(
            event=previous_day, start_at=day_start - timedelta(microseconds=1)
        )

        client = APIClient()
        response = client.get(reverse("event-list"), {"date": target_day.isoformat()})

    assert response.status_code == status.HTTP_200_OK
    payload_by_title = {item["title"]: item for item in response.data}
    assert "Starts at day start" in payload_by_title
    assert "Ends day edge" in payload_by_title
    assert "Starts next day" not in payload_by_title
    assert "Previous day" not in payload_by_title
    assert payload_by_title["Starts at day start"]["event_status"] == "upcoming"


def test_filter_date_with_same_day_sessions_returns_single_event(events_singleton):
    tz = timezone.get_current_timezone()
    target_day = (timezone.localtime(timezone.now(), tz) + timedelta(days=3)).date()
    start_of_day = timezone.make_aware(datetime.combine(target_day, time.min), tz)

    multi_session_event = Event.objects.create(title="Two sessions one day")
    EventDate.objects.create(
        event=multi_session_event, start_at=start_of_day + timedelta(hours=9)
    )
    EventDate.objects.create(
        event=multi_session_event, start_at=start_of_day + timedelta(hours=18)
    )

    client = APIClient()
    response = client.get(reverse("event-list"), {"date": target_day.isoformat()})

    assert response.status_code == status.HTTP_200_OK
    matching = [
        item for item in response.data if item["title"] == "Two sessions one day"
    ]
    assert len(matching) == 1
    assert matching[0]["occurrences_count"] == 2
    assert matching[0]["event_status"] == "upcoming"


def test_filter_start_range_with_category_combination(events_singleton):
    tz = timezone.get_current_timezone()
    target_day = (timezone.localtime(timezone.now(), tz) + timedelta(days=6)).date()
    start_of_day = timezone.make_aware(datetime.combine(target_day, time.min), tz)

    selected_category = events_singleton.category
    other_category = Category.objects.create(
        slug="events-other",
        nombre="Events Other",
        taxonomy="events",
    )

    in_range_and_category = Event.objects.create(
        title="Range and category match",
        category=selected_category,
    )
    EventDate.objects.create(
        event=in_range_and_category,
        start_at=start_of_day + timedelta(hours=11),
    )

    in_range_other_category = Event.objects.create(
        title="Range other category",
        category=other_category,
    )
    EventDate.objects.create(
        event=in_range_other_category,
        start_at=start_of_day + timedelta(hours=12),
    )

    outside_range_same_category = Event.objects.create(
        title="Outside range same category",
        category=selected_category,
    )
    EventDate.objects.create(
        event=outside_range_same_category,
        start_at=start_of_day + timedelta(days=2),
    )

    client = APIClient()
    response = client.get(
        reverse("event-list"),
        {
            "start_from": target_day.isoformat(),
            "start_to": target_day.isoformat(),
            "category": str(selected_category.id),
        },
    )

    assert response.status_code == status.HTTP_200_OK
    returned_titles = {item["title"] for item in response.data}
    assert "Range and category match" in returned_titles
    assert "Range other category" not in returned_titles
    assert "Outside range same category" not in returned_titles


def test_list_event_status_transitions(events_singleton):
    now = timezone.now().replace(microsecond=0)

    upcoming = Event.objects.create(title="Status upcoming")
    EventDate.objects.create(event=upcoming, start_at=now + timedelta(hours=2))

    ongoing = Event.objects.create(title="Status ongoing")
    EventDate.objects.create(
        event=ongoing,
        start_at=now - timedelta(hours=1),
        end_at=now + timedelta(hours=1),
    )

    finished = Event.objects.create(title="Status finished")
    EventDate.objects.create(
        event=finished,
        start_at=now - timedelta(hours=3),
        end_at=now - timedelta(hours=1),
    )

    client = APIClient()
    response = client.get(reverse("event-list"))

    assert response.status_code == status.HTTP_200_OK
    payload_by_title = {item["title"]: item for item in response.data}
    assert payload_by_title["Status upcoming"]["event_status"] == "upcoming"
    assert payload_by_title["Status ongoing"]["event_status"] == "ongoing"
    assert payload_by_title["Status finished"]["event_status"] == "finished"
