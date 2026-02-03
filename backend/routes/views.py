"""Views for the routes app."""

from __future__ import annotations

import logging

from django.conf import settings
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Route
from .serializers import RouteSerializer, RouteDetailSerializer


logger = logging.getLogger(__name__)


class RouteViewSet(viewsets.ModelViewSet):
    """API endpoints for routes."""

    queryset = (
        Route.objects.all()
        .select_related("category", "featured_media", "gpx_file")
        .prefetch_related("attachments", "tags", "gallery", "route_waypoints__place")
    )
    serializer_class = RouteSerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return RouteDetailSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        queryset = self.queryset
        params = self.request.query_params

        # Filter by published status
        is_published = params.get("is_published")
        if is_published is not None:
            normalized = is_published.lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_published=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_published=False)

        # Filter by featured status
        featured = params.get("featured") or params.get("is_featured")
        if featured is not None:
            normalized = featured.lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_featured=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_featured=False)

        # Filter by route type
        route_type = params.get("route_type") or params.get("type")
        if route_type:
            queryset = queryset.filter(route_type=route_type)

        # Filter by difficulty
        difficulty = params.get("difficulty")
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)

        # Filter by circular
        is_circular = params.get("is_circular") or params.get("circular")
        if is_circular is not None:
            normalized = is_circular.lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_circular=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_circular=False)

        # Filter by category
        category_param = params.get("category")
        if category_param:
            if category_param.isdigit():
                queryset = queryset.filter(category_id=int(category_param))
            else:
                queryset = queryset.filter(category__slug=category_param)

        # Filter by tag
        tag_param = params.get("tag")
        if tag_param:
            queryset = queryset.filter(tags__slug=tag_param)
        tags_param = params.get("tags")
        if tags_param:
            slugs = [s.strip() for s in tags_param.split(",") if s.strip()]
            if slugs:
                queryset = queryset.filter(tags__slug__in=slugs).distinct()

        # Search
        search = params.get("search") or params.get("q")
        if search:
            queryset = queryset.filter(
                Q(translations__title__icontains=search)
                | Q(translations__summary__icontains=search)
                | Q(translations__description__icontains=search)
                | Q(slug__icontains=search)
            ).distinct()

        return queryset

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def auto_translate(self, request, slug=None):
        """
        Auto-translate route to all configured languages using LLM.

        POST /api/v1/routes/{slug}/auto_translate/

        Request body (optional):
        {
            "source_lang": "ca",
            "target_langs": ["es", "en", "fr"]
        }
        """
        route = self.get_object()

        source_lang = request.data.get("source_lang", settings.LANGUAGE_CODE)

        configured_langs = [lang[0] for lang in settings.LANGUAGES]
        default_targets = [lang for lang in configured_langs if lang != source_lang]
        target_langs = request.data.get("target_langs", default_targets)

        # Get source content
        route.set_current_language(source_lang)
        source_title = request.data.get("title", route.title)
        source_summary = request.data.get("summary", route.summary or "")
        source_description = request.data.get("description", route.description or "")
        source_instructions = request.data.get("instructions", route.instructions or "")

        if not source_title:
            return Response(
                {
                    "success": False,
                    "error": f"Route has no content in {source_lang} to translate from",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from llm_translations.utils import translate_text, TranslationError
        except ImportError:
            return Response(
                {"success": False, "error": "LLM translation module not available"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        translations = {}
        errors = {}

        for target_lang in target_langs:
            try:
                translated_title = translate_text(
                    text=source_title,
                    source_lang=source_lang,
                    target_lang=target_lang,
                    log_translation=True,
                )

                translated_summary = ""
                if source_summary:
                    translated_summary = translate_text(
                        text=source_summary,
                        source_lang=source_lang,
                        target_lang=target_lang,
                        log_translation=True,
                    )

                translated_description = ""
                if source_description:
                    translated_description = translate_text(
                        text=source_description,
                        source_lang=source_lang,
                        target_lang=target_lang,
                        log_translation=True,
                    )

                translated_instructions = ""
                if source_instructions:
                    translated_instructions = translate_text(
                        text=source_instructions,
                        source_lang=source_lang,
                        target_lang=target_lang,
                        log_translation=True,
                    )

                route.set_current_language(target_lang, initialize=True)
                route.title = translated_title
                route.summary = translated_summary
                route.description = translated_description
                route.instructions = translated_instructions
                route.save_translations()

                translations[target_lang] = {
                    "title": translated_title,
                    "summary": translated_summary,
                    "description": translated_description,
                    "instructions": translated_instructions,
                }

                logger.info(
                    f"Translated route {route.id} to {target_lang}: '{translated_title}'"
                )

            except TranslationError as e:
                error_msg = str(e)
                errors[target_lang] = error_msg
                logger.error(
                    f"Failed to translate route {route.id} to {target_lang}: {error_msg}"
                )
            except Exception as e:
                error_msg = f"Unexpected error: {str(e)}"
                errors[target_lang] = error_msg
                logger.exception(
                    f"Unexpected error translating route {route.id} to {target_lang}"
                )

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
