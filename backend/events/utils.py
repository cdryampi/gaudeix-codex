from __future__ import annotations

from django.utils import timezone

from .models import Event


def get_upcoming_events(queryset=None, limit=None):
    """
    Return upcoming published events ordered by start date.
    """
    qs = queryset if queryset is not None else Event.objects.all()
    qs = qs.filter(start_at__gte=timezone.now(), is_published=True).order_by("start_at")
    if limit is not None:
        return qs[:limit]
    return qs
