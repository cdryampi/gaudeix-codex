"""Model and utility tests for gamification app."""

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone

from core.models import Category
from events.models import Event, EventCategorySingleton
from gamification.models import EventCheckin, PointTransaction, UserPoints
from gamification.utils import award_event_checkin

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


def test_user_points_created_on_user_creation():
    user = User.objects.create_user(username="pointsuser", password="pass123")

    user_points = UserPoints.objects.get(user=user)
    assert user_points.total_points == 100
    assert user_points.level == 1
    assert PointTransaction.objects.filter(
        user=user,
        transaction_type=PointTransaction.TransactionType.REGISTRATION_BONUS,
    ).exists()


def test_award_event_checkin_adds_points(events_singleton):
    user = User.objects.create_user(username="checkinuser", password="pass123")
    event = Event.objects.create(
        title="Checkin Event",
        start_at=timezone.now(),
        points_value=30,
    )

    checkin = award_event_checkin(user=user, event=event)

    assert EventCheckin.objects.filter(user=user, event=event).exists()
    assert checkin.points_awarded == 30

    user_points = UserPoints.objects.get(user=user)
    assert user_points.total_points == 155
    assert user_points.events_completed == 1

    assert PointTransaction.objects.filter(
        user=user,
        transaction_type=PointTransaction.TransactionType.EVENT_CHECKIN,
    ).exists()


def test_award_event_checkin_only_once(events_singleton):
    user = User.objects.create_user(username="onceuser", password="pass123")
    event = Event.objects.create(
        title="Once Event",
        start_at=timezone.now(),
        points_value=20,
    )

    award_event_checkin(user=user, event=event)

    with pytest.raises(ValueError):
        award_event_checkin(user=user, event=event)


def test_award_event_checkin_monthly_bonuses(events_singleton):
    user = User.objects.create_user(username="bonususer", password="pass123")
    events = [
        Event.objects.create(
            title=f"Event {index}",
            start_at=timezone.now(),
            points_value=10,
        )
        for index in range(5)
    ]

    for event in events:
        award_event_checkin(user=user, event=event)

    user_points = UserPoints.objects.get(user=user)
    assert user_points.events_completed == 5
    assert user_points.total_points == 225
