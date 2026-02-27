"""Views for the festes app."""

# pyright: reportAttributeAccessIssue=false, reportIncompatibleMethodOverride=false, reportOperatorIssue=false

from __future__ import annotations

import logging

from django.conf import settings
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import (
    Festa,
    Program,
    ProgramStatusChoices,
    Sponsor,
    Venue,
)
from .permissions import IsAdminOrReadOnly
from .serializers import (
    FestaDetailSerializer,
    FestaSerializer,
    ProgramSerializer,
    SponsorSerializer,
    VenueSerializer,
)


logger = logging.getLogger(__name__)


TRUE_VALUES = {"true", "1", "yes"}
FALSE_VALUES = {"false", "0", "no"}


def _normalize_bool_param(value: str | None) -> bool | None:
    if value is None:
        return None
    normalized = value.lower()
    if normalized in TRUE_VALUES:
        return True
    if normalized in FALSE_VALUES:
        return False
    return None


def _get_str_param(params, key: str) -> str | None:
    value = params.get(key)
    return value if isinstance(value, str) else None


class FestaProgrammingPagination(PageNumberPagination):
    """Standard page-number pagination for programming endpoints."""

    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 1000


class FestaViewSet(viewsets.ModelViewSet):
    """API endpoints for festes."""

    queryset = (  # type: ignore[attr-defined]
        Festa.objects.all()
        .select_related("category", "featured_media", "program_pdf")
        .prefetch_related("tags", "gallery", "posters", "sponsors", "events")
    )
    serializer_class = FestaSerializer
    lookup_field = "slug"

    def get_permissions(self):
        """
        Set permissions based on action.
        Public read access (list, retrieve, current).
        Authenticated admin write access (create, update, destroy, auto_translate).
        """
        if self.action in ["list", "retrieve", "current"]:
            return [AllowAny()]
        elif self.action == "auto_translate":
            return [IsAuthenticated(), IsAdminOrReadOnly()]
        else:
            # create, update, partial_update, destroy
            return [IsAdminOrReadOnly()]

    def get_serializer_class(self):  # type: ignore[override]
        if self.action == "retrieve":
            return FestaDetailSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        queryset = self.queryset
        params = self.request.query_params

        # Filter by published status
        is_published = _get_str_param(params, "is_published")
        if is_published is not None:
            normalized = is_published.lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_published=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_published=False)

        # Filter by featured status
        featured = _get_str_param(params, "featured") or _get_str_param(
            params, "is_featured"
        )
        if featured is not None:
            normalized = featured.lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_featured=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_featured=False)

        # Filter by current
        is_current = _get_str_param(params, "is_current") or _get_str_param(
            params, "current"
        )
        if is_current is not None:
            normalized = is_current.lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_current=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_current=False)

        # Filter by year
        year = _get_str_param(params, "year")
        if year and year.isdigit():
            queryset = queryset.filter(year=int(year))

        # Filter by category
        category_param = _get_str_param(params, "category")
        if category_param:
            if category_param.isdigit():
                queryset = queryset.filter(category_id=int(category_param))
            else:
                queryset = queryset.filter(category__slug=category_param)

        # Filter by tag
        tag_param = _get_str_param(params, "tag")
        if tag_param:
            queryset = queryset.filter(tags__slug=tag_param)
        tags_param = _get_str_param(params, "tags")
        if tags_param:
            slugs = [s.strip() for s in tags_param.split(",") if s.strip()]
            if slugs:
                queryset = queryset.filter(tags__slug__in=slugs).distinct()

        # Search
        search = _get_str_param(params, "search") or _get_str_param(params, "q")
        if search:
            queryset = queryset.filter(
                Q(translations__title__icontains=search)
                | Q(translations__subtitle__icontains=search)
                | Q(translations__summary__icontains=search)
                | Q(translations__description__icontains=search)
                | Q(slug__icontains=search)
            ).distinct()

        return queryset

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def current(self, request):
        """
        Get the current festa.

        GET /api/v1/festes/current/
        """
        festa = Festa.objects.filter(is_current=True, is_published=True).first()
        if not festa:
            return Response(
                {"detail": "No current festa found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = FestaDetailSerializer(festa, context={"request": request})
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsAdminOrReadOnly],
    )
    def auto_translate(self, request, slug=None):
        """
        Auto-translate festa to all configured languages using LLM.

        POST /api/v1/festes/{slug}/auto_translate/
        """
        festa = self.get_object()

        source_lang = request.data.get("source_lang", settings.LANGUAGE_CODE)

        configured_langs = [lang[0] for lang in settings.LANGUAGES]
        default_targets = [lang for lang in configured_langs if lang != source_lang]
        target_langs = request.data.get("target_langs", default_targets)

        # Get source content
        festa.set_current_language(source_lang)
        source_title = request.data.get("title", festa.title)
        source_subtitle = request.data.get("subtitle", festa.subtitle or "")
        source_summary = request.data.get("summary", festa.summary or "")
        source_description = request.data.get("description", festa.description or "")
        source_program = request.data.get("program_text", festa.program_text or "")

        if not source_title:
            return Response(
                {
                    "success": False,
                    "error": f"Festa has no content in {source_lang} to translate from",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from llm_translations.utils import (  # pyright: ignore[reportImplicitRelativeImport]
                translate_text,
                TranslationError,
            )
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

                translated_subtitle = ""
                if source_subtitle:
                    translated_subtitle = translate_text(
                        text=source_subtitle,
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

                translated_program = ""
                if source_program:
                    translated_program = translate_text(
                        text=source_program,
                        source_lang=source_lang,
                        target_lang=target_lang,
                        log_translation=True,
                    )

                festa.set_current_language(target_lang, initialize=True)
                festa.title = translated_title
                festa.subtitle = translated_subtitle
                festa.summary = translated_summary
                festa.description = translated_description
                festa.program_text = translated_program
                festa.save_translations()

                translations[target_lang] = {
                    "title": translated_title,
                    "subtitle": translated_subtitle,
                    "summary": translated_summary,
                    "description": translated_description,
                    "program_text": translated_program,
                }

                logger.info(
                    f"Translated festa {festa.id} to {target_lang}: '{translated_title}'"
                )

            except TranslationError as e:
                error_msg = str(e)
                errors[target_lang] = error_msg
                logger.error(
                    f"Failed to translate festa {festa.id} to {target_lang}: {error_msg}"
                )
            except Exception as e:
                error_msg = f"Unexpected error: {str(e)}"
                errors[target_lang] = error_msg
                logger.exception(
                    f"Unexpected error translating festa {festa.id} to {target_lang}"
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


class SponsorViewSet(viewsets.ModelViewSet):
    """API endpoints for sponsors."""

    queryset = Sponsor.objects.all().select_related("festa", "logo")  # type: ignore[attr-defined]
    serializer_class = SponsorSerializer

    def get_permissions(self):
        """
        Set permissions based on action.
        Public read access (list, retrieve).
        Authenticated admin write access (create, update, destroy).
        """
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        else:
            # create, update, partial_update, destroy
            return [IsAdminOrReadOnly()]

    def get_queryset(self):
        queryset = self.queryset
        params = self.request.query_params

        # Filter by festa
        festa_param = _get_str_param(params, "festa")
        if festa_param:
            if festa_param.isdigit():
                queryset = queryset.filter(festa_id=int(festa_param))
            else:
                queryset = queryset.filter(festa__slug=festa_param)

        # Filter by tier
        tier = _get_str_param(params, "tier")
        if tier:
            queryset = queryset.filter(tier=tier)

        return queryset


class ProgramViewSet(viewsets.ModelViewSet):
    """API endpoints for festa programs."""

    queryset = Program.objects.all().select_related("festa")  # type: ignore[attr-defined]
    serializer_class = ProgramSerializer
    lookup_field = "slug"
    pagination_class = FestaProgrammingPagination

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminOrReadOnly()]

    def get_queryset(self):
        queryset = self.queryset
        params = self.request.query_params

        festa_param = _get_str_param(params, "festa")
        if festa_param:
            if festa_param.isdigit():
                queryset = queryset.filter(festa_id=int(festa_param))
            else:
                queryset = queryset.filter(festa__slug=festa_param)

        status_param = _get_str_param(params, "status")
        if status_param:
            queryset = queryset.filter(status=status_param)

        is_published = _normalize_bool_param(_get_str_param(params, "is_published"))
        if is_published is not None:
            queryset = queryset.filter(
                status=(
                    ProgramStatusChoices.PUBLISHED
                    if is_published
                    else ProgramStatusChoices.DRAFT
                )
            )

        search = _get_str_param(params, "search") or _get_str_param(params, "q")
        if search:
            queryset = queryset.filter(
                Q(translations__title__icontains=search)
                | Q(translations__subtitle__icontains=search)
                | Q(translations__description__icontains=search)
                | Q(slug__icontains=search)
            ).distinct()

        ordering_param = _get_str_param(params, "ordering")
        allowed_ordering = {
            "order": "order",
            "-order": "-order",
            "start_date": "start_date",
            "-start_date": "-start_date",
            "created_at": "fecha_creacion",
            "-created_at": "-fecha_creacion",
            "title": "translations__title",
            "-title": "-translations__title",
        }
        if ordering_param in allowed_ordering:
            queryset = queryset.order_by(allowed_ordering[ordering_param], "id")

        return queryset


class VenueViewSet(viewsets.ModelViewSet):
    """API endpoints for venues used by festa events."""

    queryset = Venue.objects.all()  # type: ignore[attr-defined]
    serializer_class = VenueSerializer
    lookup_field = "slug"
    pagination_class = FestaProgrammingPagination

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminOrReadOnly()]

    def get_queryset(self):
        queryset = self.queryset
        params = self.request.query_params

        is_published = _normalize_bool_param(_get_str_param(params, "is_published"))
        if is_published is not None:
            queryset = queryset.filter(is_published=is_published)

        is_accessible = _normalize_bool_param(_get_str_param(params, "is_accessible"))
        if is_accessible is not None:
            queryset = queryset.filter(is_accessible=is_accessible)

        city = _get_str_param(params, "city")
        if city:
            queryset = queryset.filter(city__icontains=city)

        search = _get_str_param(params, "search") or _get_str_param(params, "q")
        if search:
            queryset = queryset.filter(
                Q(translations__name__icontains=search)
                | Q(translations__description__icontains=search)
                | Q(address__icontains=search)
                | Q(city__icontains=search)
                | Q(slug__icontains=search)
            ).distinct()

        return queryset


