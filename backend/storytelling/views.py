from __future__ import annotations

import logging

from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Story
from .serializers import StorySerializer

logger = logging.getLogger(__name__)


class StoryViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Cabrera de Mar stories.
    """

    queryset = Story.objects.all()
    serializer_class = StorySerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        # Write operations require staff or admin status
        return [IsAuthenticated()]

    def get_queryset(self):
        # Fresh QuerySet
        queryset = Story.objects.all()
        params = self.request.query_params

        # Filter by published status
        is_published = params.get("is_published")
        if is_published is not None:
            normalized = is_published.lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_published=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_published=False)

        # Filter by category slug or ID
        category_param = params.get("category")
        if category_param:
            if category_param.isdigit():
                queryset = queryset.filter(category_id=int(category_param))
            else:
                queryset = queryset.filter(category__slug=category_param)

        # Filter by historical period
        historical_period = params.get("historical_period")
        if historical_period:
            queryset = queryset.filter(historical_period__iexact=historical_period)

        # Filter by difficulty
        difficulty = params.get("difficulty")
        if difficulty:
            queryset = queryset.filter(difficulty__iexact=difficulty)

        # Full-text search over translatable fields
        search_text = params.get("search") or params.get("q")
        if search_text:
            queryset = queryset.filter(
                Q(translations__title__icontains=search_text)
                | Q(translations__summary__icontains=search_text)
                | Q(translations__content__icontains=search_text)
            ).distinct()

        return queryset
