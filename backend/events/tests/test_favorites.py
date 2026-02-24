# Integration tests for the events favorites feature.
#
# Covers: toggle (add/remove), list endpoint, auth enforcement,
# idempotency and user isolation.

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category
from events.models import Event, EventDate, EventCategorySingleton, UserFavoriteEvent

User = get_user_model()

pytestmark = pytest.mark.django_db


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def events_category() -> Category:
    category, _ = Category.objects.get_or_create(
        slug="events", defaults={"taxonomy": "events", "nombre": "Events"}
    )
    return category


@pytest.fixture
def events_singleton(events_category) -> EventCategorySingleton:
    singleton, _ = EventCategorySingleton.objects.get_or_create(
        category=events_category
    )
    return singleton


@pytest.fixture
def user_a():
    return User.objects.create_user(username="user_a", password="pass123")


@pytest.fixture
def user_b():
    return User.objects.create_user(username="user_b", password="pass123")


@pytest.fixture
def published_event(events_singleton):
    event = Event.objects.create(title="Favoritable Event", is_published=True)
    EventDate.objects.create(
        event=event,
        start_at=timezone.now() + timezone.timedelta(days=3),
    )
    return event


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_toggle_favorite_add(published_event, user_a):
    """POST /{slug}/favorite/ while authenticated → 201 and is_favorited=True."""
    client = APIClient()
    client.force_authenticate(user=user_a)

    url = reverse("event-favorite", kwargs={"slug": published_event.slug})
    response = client.post(url, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["is_favorited"] is True
    assert response.data["favorites_count"] == 1
    assert UserFavoriteEvent.objects.filter(user=user_a, event=published_event).exists()


def test_toggle_favorite_remove(published_event, user_a):
    """DELETE /{slug}/favorite/ removes the favourite → 204, DB row deleted."""
    UserFavoriteEvent.objects.create(user=user_a, event=published_event)

    client = APIClient()
    client.force_authenticate(user=user_a)

    url = reverse("event-favorite", kwargs={"slug": published_event.slug})
    response = client.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not UserFavoriteEvent.objects.filter(
        user=user_a, event=published_event
    ).exists()


def test_list_favorites(published_event, user_a):
    """GET /events/favorites/ returns only the authenticated user's favourites."""
    UserFavoriteEvent.objects.create(user=user_a, event=published_event)

    client = APIClient()
    client.force_authenticate(user=user_a)

    url = reverse("event-favorites")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    # Paginated response
    data = response.data
    results = data["results"] if isinstance(data, dict) and "results" in data else data
    assert len(results) == 1
    assert results[0]["slug"] == published_event.slug


def test_favorites_requires_auth():
    """GET /events/favorites/ without token → 401."""
    client = APIClient()
    url = reverse("event-favorites")
    response = client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_toggle_requires_auth(published_event):
    """POST /{slug}/favorite/ without token → 401."""
    client = APIClient()
    url = reverse("event-favorite", kwargs={"slug": published_event.slug})
    response = client.post(url, format="json")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_idempotent_favorite(published_event, user_a):
    """Marking the same event as favourite twice creates only one DB row."""
    client = APIClient()
    client.force_authenticate(user=user_a)

    url = reverse("event-favorite", kwargs={"slug": published_event.slug})
    client.post(url, format="json")
    client.post(url, format="json")

    count = UserFavoriteEvent.objects.filter(user=user_a, event=published_event).count()
    assert count == 1


def test_favorite_isolation(events_singleton, user_a, user_b):
    """User A's favourites are not visible in User B's list."""
    event = Event.objects.create(title="Isolated Event", is_published=True)
    EventDate.objects.create(
        event=event,
        start_at=timezone.now() + timezone.timedelta(days=5),
    )
    UserFavoriteEvent.objects.create(user=user_a, event=event)

    client = APIClient()
    client.force_authenticate(user=user_b)

    url = reverse("event-favorites")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    data = response.data
    results = data["results"] if isinstance(data, dict) and "results" in data else data
    assert len(results) == 0
