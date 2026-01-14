from __future__ import annotations

import logging

from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.db.models import Count, Exists, OuterRef, Q
from rest_framework import viewsets, status

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

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return EventDetailSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        queryset = self.queryset
        params = self.request.query_params

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

        tag_param = params.get("tag")
        if tag_param:
            queryset = queryset.filter(tags__slug=tag_param)
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

        start_from = self._parse_datetime(params.get("start_from"))
        if start_from:
            queryset = queryset.filter(start_at__gte=start_from)

        start_to = self._parse_datetime(params.get("start_to"))
        if start_to:
            queryset = queryset.filter(start_at__lte=start_to)

        queryset = queryset.annotate(
            favorites_count=Count("favorited_by", distinct=True)
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

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated],
        url_path="checkin",
    )
    def checkin(self, request, pk=None):
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
    def my_checkin(self, request, pk=None):
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
    def favorite(self, request, pk=None):
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

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def auto_translate(self, request, pk=None):
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

        # Validate source language exists
        event.set_current_language(source_lang)
        if not event.title:
            return Response(
                {
                    "success": False,
                    "error": f"Event has no content in {source_lang} to translate from",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        source_title = event.title
        source_description = event.description or ""

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
                event.description = translated_description
                event.save_translations()

                translations[target_lang] = {
                    "title": translated_title,
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
