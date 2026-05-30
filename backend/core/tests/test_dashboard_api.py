import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from events.models import Event
from core.models import Category
from places.models import Place, PlaceCategorySingleton
from notifications.models import Notification

User = get_user_model()

pytestmark = pytest.mark.django_db


@pytest.fixture
def places_singleton():
    category = Category.objects.create(nombre="Places", slug="places-test-dash")
    return PlaceCategorySingleton.objects.create(category=category)


@pytest.fixture
def auth_client():
    user = User.objects.create_user(username="tester", password="pass123", is_staff=True)
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def anon_client():
    return APIClient()


def test_dashboard_requires_auth(anon_client):
    url = reverse("dashboard-list")
    response = anon_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_dashboard_returns_zero_when_empty(auth_client):
    url = reverse("dashboard-list")
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["totalUsers"] >= 1
    assert data["activeEvents"] == 0
    assert data["totalPlaces"] == 0
    assert data["pendingNotifications"] == 0


def test_dashboard_returns_correct_counts(auth_client, places_singleton):
    user = User.objects.create_user(username="other", password="pass123")
    Event.objects.create(slug="event-1", is_published=True, creado_por=user)
    Event.objects.create(slug="event-2", is_published=True, creado_por=user)
    Event.objects.create(slug="event-draft", is_published=False, creado_por=user)
    Place.objects.create(slug="place-1", is_published=True, creado_por=user)
    Place.objects.create(slug="place-2", is_published=True, creado_por=user)
    Place.objects.create(slug="place-draft", is_published=False, creado_por=user)
    Notification.objects.create(title="Unread 1", body="test", read=False, user=user)
    Notification.objects.create(title="Read 1", body="test", read=True, user=user)

    url = reverse("dashboard-list")
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["totalUsers"] == 2
    assert data["activeEvents"] == 2
    assert data["totalPlaces"] == 2
    assert data["pendingNotifications"] == 1


def test_dashboard_activity_returns_most_recent_first(auth_client):
    user = User.objects.create_user(username="recent", password="pass123")
    Event.objects.create(slug="old-event", is_published=True, creado_por=user)
    Event.objects.create(slug="new-event", is_published=True, creado_por=user)

    url = reverse("dashboard-list")
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["recentActivity"]) > 0
    timestamps = [a["timestamp"] for a in data["recentActivity"]]
    assert timestamps == sorted(timestamps, reverse=True)
