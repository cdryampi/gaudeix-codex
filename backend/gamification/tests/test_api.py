"""API tests for gamification endpoints."""

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from django.urls import reverse

from core.models import Category
from events.models import Event, EventCategorySingleton
from gamification.models import PointTransaction
from gamification.utils import add_points

User = get_user_model()

pytestmark = pytest.mark.django_db


@pytest.fixture
def events_category() -> Category:
    category = Category.objects.create(
        slug="events", taxonomy="events", nombre="Events"
    )
    category.set_current_language("ca")
    category.nombre = "Esdeveniments"
    category.save()
    return category


@pytest.fixture
def events_singleton(events_category) -> EventCategorySingleton:
    return EventCategorySingleton.objects.create(category=events_category)


def test_my_points_endpoint_returns_rank():
    user = User.objects.create_user(username="rankuser", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)

    url = reverse("user-my-points")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["total_points"] == 100
    assert response.data["level"] == 1
    assert response.data["rank"] == 1


def test_my_points_history_endpoint():
    user = User.objects.create_user(username="historyuser", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)

    url = reverse("user-my-points-history")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1


def test_event_checkin_endpoints(events_singleton):
    user = User.objects.create_user(username="checkinapi", password="pass123")
    event = Event.objects.create(
        title="Checkin API",
        start_at=timezone.now(),
        points_value=40,
    )

    client = APIClient()
    client.force_authenticate(user=user)

    checkin_url = reverse("event-checkin", kwargs={"slug": event.slug})
    response = client.post(checkin_url, {}, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["checkin"]["points_awarded"] == 40

    second_response = client.post(checkin_url, {}, format="json")
    assert second_response.status_code == status.HTTP_400_BAD_REQUEST

    my_checkin_url = reverse("event-my-checkin", kwargs={"slug": event.slug})
    my_checkin_response = client.get(my_checkin_url)

    assert my_checkin_response.status_code == status.HTTP_200_OK
    assert my_checkin_response.data["checked_in"] is True


def test_ranking_endpoints():
    user_low = User.objects.create_user(username="low", password="pass123")
    user_high = User.objects.create_user(username="high", password="pass123")

    add_points(
        user=user_high,
        points=200,
        transaction_type=PointTransaction.TransactionType.MANUAL,
        description="Bonus",
    )

    client = APIClient()
    ranking_url = reverse("ranking-list")
    response = client.get(ranking_url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data[0]["user"]["username"] == "high"

    monthly_url = reverse("ranking-monthly")
    monthly_response = client.get(monthly_url)

    assert monthly_response.status_code == status.HTTP_200_OK
    assert monthly_response.data[0]["user"]["username"] == "high"


def test_my_rank_endpoint():
    user = User.objects.create_user(username="myrank", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)

    url = reverse("user-my-rank")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["rank"] == 1
