"""Utility helpers for awarding points and calculating rankings."""

from __future__ import annotations

from datetime import datetime
import logging

from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone

from .models import EventCheckin, PointTransaction, UserPoints

logger = logging.getLogger(__name__)

REGISTRATION_BONUS = 100
FIRST_EVENT_MONTH_BONUS = 25
FIVE_EVENTS_MONTH_BONUS = 50
LEVEL_POINTS_THRESHOLD = 500


def get_or_create_user_points(user):
    user_points, _ = UserPoints.objects.get_or_create(user=user)
    return user_points


def calculate_level(total_points: int) -> int:
    return max(1, total_points // LEVEL_POINTS_THRESHOLD + 1)


@transaction.atomic
def add_points(
    *,
    user,
    points: int,
    transaction_type: str,
    description: str,
    event=None,
) -> PointTransaction:
    user_points = get_or_create_user_points(user)
    new_total = user_points.total_points + points
    user_points.total_points = max(0, new_total)
    user_points.level = calculate_level(user_points.total_points)
    user_points.save(update_fields=["total_points", "level"])

    return PointTransaction.objects.create(
        user=user,
        points=points,
        transaction_type=transaction_type,
        event=event,
        description=description,
    )


def _month_bounds(value: datetime) -> tuple[datetime, datetime]:
    month_start = value.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if value.month == 12:
        next_month = value.replace(year=value.year + 1, month=1, day=1)
    else:
        next_month = value.replace(month=value.month + 1, day=1)
    month_end = next_month.replace(hour=0, minute=0, second=0, microsecond=0)
    return month_start, month_end


@transaction.atomic
def award_event_checkin(*, user, event, event_date=None) -> EventCheckin:
    if EventCheckin.objects.filter(user=user, event=event).exists():
        raise ValueError("User already checked in for this event")

    if event_date is not None:
        if event_date.event_id != event.id:
            raise ValueError("Event date does not belong to the specified event")

        now = timezone.now()
        window_start = event_date.start_at - timezone.timedelta(minutes=30)
        window_end = event_date.end_at or (event_date.start_at + timezone.timedelta(hours=3))
        if not (window_start <= now <= window_end):
            raise ValueError("Check-in is only allowed within the session time window")

    now = timezone.now()
    month_start, month_end = _month_bounds(now)
    completed_this_month = EventCheckin.objects.filter(
        user=user,
        checked_in_at__gte=month_start,
        checked_in_at__lt=month_end,
    ).count()

    checkin = EventCheckin.objects.create(
        user=user,
        event=event,
        event_date=event_date,
        points_awarded=event.points_value,
    )

    add_points(
        user=user,
        points=event.points_value,
        transaction_type=PointTransaction.TransactionType.EVENT_CHECKIN,
        description=f"Check-in en evento {event.id}",
        event=event,
    )

    try:
        from notifications.models import Notification
        from notifications.utils import send_push_notification

        send_push_notification(
            user=user,
            title="Puntos ganados",
            body=f"Has ganado {event.points_value} puntos por check-in.",
            notification_type=Notification.NotificationType.POINTS_EARNED,
            data={"event_id": event.id, "points": event.points_value},
        )
    except Exception as exc:
        logger.warning("Unable to send points notification: %s", exc)

    user_points = get_or_create_user_points(user)
    user_points.events_completed += 1
    user_points.save(update_fields=["events_completed"])

    if completed_this_month == 0:
        add_points(
            user=user,
            points=FIRST_EVENT_MONTH_BONUS,
            transaction_type=PointTransaction.TransactionType.MANUAL,
            description="Bonus por primer evento del mes",
            event=event,
        )

    if completed_this_month == 4:
        add_points(
            user=user,
            points=FIVE_EVENTS_MONTH_BONUS,
            transaction_type=PointTransaction.TransactionType.MANUAL,
            description="Bonus por completar 5 eventos en el mes",
            event=event,
        )

    return checkin


def get_total_rankings(limit: int | None = None) -> list[dict]:
    queryset = UserPoints.objects.select_related("user").order_by(
        "-total_points", "user__id"
    )
    if limit:
        queryset = queryset[:limit]
    rankings = []
    for index, item in enumerate(queryset, start=1):
        rankings.append(
            {
                "rank": index,
                "user": item.user,
                "total_points": item.total_points,
                "level": item.level,
            }
        )
    return rankings


def get_monthly_rankings(limit: int | None = None) -> list[dict]:
    now = timezone.now()
    month_start, month_end = _month_bounds(now)
    queryset = (
        PointTransaction.objects.filter(
            created_at__gte=month_start, created_at__lt=month_end
        )
        .values("user")
        .annotate(total_points=Sum("points"))
        .order_by("-total_points", "user")
    )
    if limit:
        queryset = queryset[:limit]

    rankings = []
    for index, item in enumerate(queryset, start=1):
        rankings.append(
            {
                "rank": index,
                "user_id": item["user"],
                "total_points": item["total_points"] or 0,
            }
        )
    return rankings


def get_user_rank(user) -> int:
    try:
        user_points = UserPoints.objects.get(user=user)
    except UserPoints.DoesNotExist:
        return 0

    return (
        UserPoints.objects.filter(
            Q(total_points__gt=user_points.total_points)
            | Q(total_points=user_points.total_points, user__id__lt=user.id)
        ).count()
        + 1
    )


def get_user_monthly_rank(user) -> int:
    rankings = get_monthly_rankings()
    for item in rankings:
        if item["user_id"] == user.id:
            return item["rank"]
    return 0
