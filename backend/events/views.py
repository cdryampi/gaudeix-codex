from __future__ import annotations

from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Event
from .serializers import EventDetailSerializer, EventSerializer
from .utils import get_upcoming_events


class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoints for events.
    """

    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return EventDetailSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        queryset = Event.objects.all()
        params = self.request.query_params

        is_published = params.get("is_published")
        if is_published is not None:
            normalized = is_published.lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_published=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_published=False)

        start_from = self._parse_datetime(params.get("start_from"))
        if start_from:
            queryset = queryset.filter(start_at__gte=start_from)

        start_to = self._parse_datetime(params.get("start_to"))
        if start_to:
            queryset = queryset.filter(start_at__lte=start_to)

        if params.get("upcoming", "").lower() in {"true", "1", "yes"}:
            limit_param = params.get("limit")
            limit = int(limit_param) if limit_param and limit_param.isdigit() else None
            return get_upcoming_events(queryset=queryset, limit=limit)

        return queryset

    def _parse_datetime(self, value):
        if not value:
            return None
        parsed = parse_datetime(value)
        if parsed and timezone.is_naive(parsed):
            parsed = timezone.make_aware(parsed, timezone.get_default_timezone())
        return parsed
