from __future__ import annotations

import logging
from datetime import datetime, time, timedelta

from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from django.db.models import Count, Exists, OuterRef, Q
from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError

from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from gamification.models import EventCheckin
from gamification.serializers import EventCheckinSerializer
from gamification.utils import award_event_checkin, get_or_create_user_points

from .models import Event, UserFavoriteEvent

from .serializers import EventDetailSerializer, EventSerializer
from .utils import get_upcoming_events


logger = logging.getLogger(__name__)


class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoints for events.
    """

    queryset = (
        Event.objects.all()
        .select_related("category", "featured_media")
        .prefetch_related("attachments", "tags")
    )
    serializer_class = EventSerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ["list", "retrieve", "occurrences"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return EventDetailSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        queryset = self.queryset
        params = self.request.query_params
        current_tz = timezone.get_current_timezone()

        upcoming = self._parse_bool(params.get("upcoming"))
        has_future_sessions = self._parse_bool(params.get("has_future_sessions"))
        date_filter = self._parse_date(params.get("date"))
        start_from = self._parse_datetime(params.get("start_from"), bound="start")
        start_to = self._parse_datetime(params.get("start_to"), bound="end")

        if upcoming and any([start_from, start_to, date_filter]):
            raise ValidationError(
                {
                    "detail": (
                        "The 'upcoming' filter cannot be combined with "
                        "'start_from', 'start_to', or 'date'."
                    )
                }
            )

        if date_filter and (start_from or start_to):
            raise ValidationError(
                {
                    "detail": (
                        "The 'date' filter cannot be combined with "
                        "'start_from' or 'start_to'."
                    )
                }
            )

        if start_from and start_to and start_from > start_to:
            raise ValidationError(
                {"detail": "'start_from' must be less than or equal to 'start_to'."}
            )

        is_published = params.get("is_published")
        if is_published is not None:
            normalized = is_published.lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_published=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_published=False)

        featured = params.get("featured") or params.get("is_featured")
        if featured is not None:
            normalized = featured.lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_featured=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_featured=False)

        is_free = params.get("is_free")
        if is_free is not None:
            normalized = is_free.lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_free=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_free=False)

        category_param = params.get("category")
        if category_param:
            if category_param.isdigit():
                queryset = queryset.filter(category_id=int(category_param))
            else:
                queryset = queryset.filter(category__slug=category_param)

        category_slug = params.get("category_slug")
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        tag_param = params.get("tag")
        if tag_param:
            queryset = queryset.filter(tags__slug=tag_param)

        tag_slug = params.get("tag_slug")
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)

        tags_param = params.get("tags")
        if tags_param:
            slugs = [s.strip() for s in tags_param.split(",") if s.strip()]
            if slugs:
                queryset = queryset.filter(tags__slug__in=slugs).distinct()

        search = params.get("search") or params.get("q")
        if search:
            queryset = queryset.filter(
                Q(translations__title__icontains=search)
                | Q(translations__summary__icontains=search)
                | Q(translations__description__icontains=search)
                | Q(venue_name__icontains=search)
                | Q(location_text__icontains=search)
                | Q(slug__icontains=search)
            ).distinct()

        if start_from or start_to:
            date_range_filter = Q()
            if start_from:
                date_range_filter &= Q(dates__start_at__gte=start_from)
            if start_to:
                date_range_filter &= Q(dates__start_at__lte=start_to)

            queryset = queryset.filter(date_range_filter).distinct()

        if date_filter:
            day_start = timezone.make_aware(
                datetime.combine(date_filter, time.min), current_tz
            )
            day_end = day_start + timedelta(days=1)
            queryset = queryset.filter(
                dates__start_at__gte=day_start,
                dates__start_at__lt=day_end,
            ).distinct()

        if has_future_sessions:
            queryset = queryset.filter(dates__start_at__gte=timezone.now()).distinct()

        # Keep original filters for backward compatibility or simple cached field queries
        # start_from = self._parse_datetime(params.get("start_from"))
        # if start_from:
        #     queryset = queryset.filter(start_at__gte=start_from)
        #
        # start_to = self._parse_datetime(params.get("start_to"))
        # if start_to:
        #     queryset = queryset.filter(start_at__lte=start_to)

        queryset = queryset.annotate(
            favorites_count=Count("favorited_by", distinct=True),
            occurrences_count=Count("dates", distinct=True),
        )
        if self.request.user.is_authenticated:
            queryset = queryset.annotate(
                is_favorited=Exists(
                    UserFavoriteEvent.objects.filter(
                        user=self.request.user,
                        event=OuterRef("pk"),
                    )
                )
            )

        if upcoming:
            limit_param = params.get("limit")
            limit = int(limit_param) if limit_param and limit_param.isdigit() else None
            return get_upcoming_events(queryset=queryset, limit=limit)

        return queryset

    def _parse_datetime(self, value, bound="start"):
        if not value:
            return None

        raw_value = str(value).strip()
        date_only = (
            "T" not in raw_value and " " not in raw_value and ":" not in raw_value
        )
        if date_only:
            parsed_date = parse_date(raw_value)
            if parsed_date is None:
                raise ValidationError(
                    {"detail": f"Invalid datetime/date value: '{value}'"}
                )

            if bound == "end":
                parsed = datetime.combine(parsed_date, time.max)
            else:
                parsed = datetime.combine(parsed_date, time.min)

            return timezone.make_aware(parsed, timezone.get_current_timezone())

        parsed = parse_datetime(value)
        if parsed is None:
            parsed_date = parse_date(value)
            if parsed_date is None:
                raise ValidationError(
                    {"detail": f"Invalid datetime/date value: '{value}'"}
                )

            if bound == "end":
                parsed = datetime.combine(parsed_date, time.max)
            else:
                parsed = datetime.combine(parsed_date, time.min)

        if timezone.is_naive(parsed):
            parsed = timezone.make_aware(parsed, timezone.get_current_timezone())
        return parsed

    def _parse_date(self, value):
        if not value:
            return None

        parsed = parse_date(value)
        if parsed is None:
            raise ValidationError(
                {"detail": f"Invalid date value for 'date': '{value}'"}
            )
        return parsed

    def _parse_bool(self, value):
        if value is None:
            return False

        normalized = str(value).strip().lower()
        return normalized in {"true", "1", "yes"}

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated],
        url_path="checkin",
    )
    def checkin(self, request, slug=None):
        event = self.get_object()
        try:
            checkin = award_event_checkin(user=request.user, event=event)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        user_points = get_or_create_user_points(request.user)
        return Response(
            {
                "checkin": EventCheckinSerializer(checkin).data,
                "total_points": user_points.total_points,
                "level": user_points.level,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["get"],
        permission_classes=[IsAuthenticated],
        url_path="my-checkin",
    )
    def my_checkin(self, request, slug=None):
        event = self.get_object()
        checkin = EventCheckin.objects.filter(user=request.user, event=event).first()
        if not checkin:
            return Response({"checked_in": False}, status=status.HTTP_200_OK)

        return Response(
            {
                "checked_in": True,
                "checkin": EventCheckinSerializer(checkin).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post", "delete"],
        permission_classes=[IsAuthenticated],
        url_path="favorite",
    )
    def favorite(self, request, slug=None):
        event = self.get_object()
        if request.method.lower() == "post":
            UserFavoriteEvent.objects.get_or_create(user=request.user, event=event)
            favorites_count = UserFavoriteEvent.objects.filter(event=event).count()
            return Response(
                {
                    "is_favorited": True,
                    "favorites_count": favorites_count,
                },
                status=status.HTTP_201_CREATED,
            )

        UserFavoriteEvent.objects.filter(user=request.user, event=event).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
        url_path="favorites",
    )
    def favorites(self, request):
        """
        Returns the paginated list of events favorited by the current user.
        GET /api/v1/events/favorites/
        """
        queryset = self.get_queryset().filter(favorited_by__user=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def auto_translate(self, request, slug=None):
        """
        Auto-translate event to all configured languages using LLM.

        POST /api/v1/events/{id}/auto_translate/

        Request body (optional):
        {
            "source_lang": "ca",  // defaults to default language
            "target_langs": ["es", "en", "fr"]  // defaults to all configured languages except source
        }

        Response:
        {
            "success": true,
            "translations": {
                "es": {"title": "...", "description": "..."},
                "en": {"title": "...", "description": "..."},
                "fr": {"title": "...", "description": "..."}
            },
            "errors": {}
        }
        """
        event = self.get_object()

        # Get source language (default to project default language)
        source_lang = request.data.get("source_lang", settings.LANGUAGE_CODE)

        # Get target languages (default to all except source)
        configured_langs = [lang[0] for lang in settings.LANGUAGES]
        default_targets = [lang for lang in configured_langs if lang != source_lang]
        target_langs = request.data.get("target_langs", default_targets)

        # Get source text from request or database
        source_title = request.data.get("title", event.title)
        source_summary = request.data.get("summary")
        if source_summary is None:
            # If not in request, get from DB for source lang
            event.set_current_language(source_lang)
            source_summary = event.summary or ""

        source_description = request.data.get("description")
        if source_description is None:
            # If not in request, get from DB for source lang
            event.set_current_language(source_lang)
            source_description = event.description or ""

        if not source_title:
            return Response(
                {
                    "success": False,
                    "error": f"Event has no content in {source_lang} to translate from",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Import translation utility
        try:
            from llm_translations.utils import translate_text, TranslationError
        except ImportError:
            return Response(
                {"success": False, "error": "LLM translation module not available"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        translations = {}
        errors = {}

        # Translate to each target language
        for target_lang in target_langs:
            try:
                # Translate title
                translated_title = translate_text(
                    text=source_title,
                    source_lang=source_lang,
                    target_lang=target_lang,
                    log_translation=True,
                )

                # Translate summary if exists
                translated_summary = ""
                if source_summary:
                    translated_summary = translate_text(
                        text=source_summary,
                        source_lang=source_lang,
                        target_lang=target_lang,
                        log_translation=True,
                    )

                # Translate description if exists
                translated_description = ""
                if source_description:
                    translated_description = translate_text(
                        text=source_description,
                        source_lang=source_lang,
                        target_lang=target_lang,
                        log_translation=True,
                    )

                # Save translation using parler's translation system
                # Create or update translation for target language
                event.set_current_language(target_lang, initialize=True)
                event.title = translated_title
                event.summary = translated_summary
                event.description = translated_description
                event.save_translations()

                translations[target_lang] = {
                    "title": translated_title,
                    "summary": translated_summary,
                    "description": translated_description,
                }

                logger.info(
                    f"Translated event {event.id} to {target_lang}: '{translated_title}'"
                )

            except TranslationError as e:
                error_msg = str(e)
                errors[target_lang] = error_msg
                logger.error(
                    f"Failed to translate event {event.id} to {target_lang}: {error_msg}"
                )
            except Exception as e:
                error_msg = f"Unexpected error: {str(e)}"
                errors[target_lang] = error_msg
                logger.exception(
                    f"Unexpected error translating event {event.id} to {target_lang}"
                )

        # Return results
        return Response(
            {
                "success": len(errors) == 0,
                "source_lang": source_lang,
                "translations": translations,
                "errors": errors,
            },
            status=status.HTTP_200_OK
            if len(errors) == 0
            else status.HTTP_207_MULTI_STATUS,
        )

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def occurrences(self, request, slug=None):
        """
        Get all occurrences (dates) of an event.
        """
        event = self.get_object()
        # Return all EventDate objects for this event
        dates = event.dates.all().order_by("start_at")

        # We need a serializer for EventDate that maybe includes event info or just dates
        # Using EventDateSerializer defined in serializers.py?
        # But wait, serializers.py has EventDateSerializer.
        from .serializers import EventDateSerializer

        page = self.paginate_queryset(dates)
        if page is not None:
            serializer = EventDateSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = EventDateSerializer(dates, many=True)
        return Response(serializer.data)
