from __future__ import annotations

import logging
import math

from django.conf import settings
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Place, Restaurant, Accommodation
from .serializers import (
    PlaceDetailSerializer,
    PlaceSerializer,
    RestaurantSerializer,
    AccommodationSerializer,
)

logger = logging.getLogger(__name__)


class PlaceViewSet(viewsets.ModelViewSet):
    """
    API endpoints for places.
    """

    queryset = Place.objects.all()
    serializer_class = PlaceSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PlaceDetailSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        # Use the queryset attribute if defined (for subclasses), otherwise Place.objects.all()
        if self.queryset is not None:
            queryset = self.queryset
        else:
            queryset = Place.objects.all()

        params = self.request.query_params

        is_published = params.get("is_published")
        if is_published is not None:
            normalized = is_published.lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_published=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_published=False)

        category_param = params.get("category")
        if category_param:
            if category_param.isdigit():
                queryset = queryset.filter(category_id=int(category_param))
            else:
                queryset = queryset.filter(category__slug=category_param)

        search_text = params.get("search") or params.get("q")
        if search_text:
            queryset = queryset.filter(
                Q(translations__title__icontains=search_text)
                | Q(translations__description__icontains=search_text)
                | Q(location_text__icontains=search_text)
            ).distinct()

        lat_min = self._parse_float(params.get("lat_min"))
        lat_max = self._parse_float(params.get("lat_max"))
        lng_min = self._parse_float(params.get("lng_min"))
        lng_max = self._parse_float(params.get("lng_max"))
        if lat_min is not None:
            queryset = queryset.filter(latitude__gte=lat_min)
        if lat_max is not None:
            queryset = queryset.filter(latitude__lte=lat_max)
        if lng_min is not None:
            queryset = queryset.filter(longitude__gte=lng_min)
        if lng_max is not None:
            queryset = queryset.filter(longitude__lte=lng_max)

        near_param = params.get("near")
        if near_param:
            queryset = self._filter_near(queryset, near_param, params.get("radius_km"))

        return queryset

    def _parse_float(self, value):
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    def _filter_near(self, queryset, near_param: str, radius_param: str | None):
        try:
            lat_str, lng_str = near_param.split(",")
            lat = float(lat_str)
            lng = float(lng_str)
        except (ValueError, TypeError):
            return queryset

        radius_km = self._parse_float(radius_param) or 5.0
        ids = []
        for place in queryset.filter(latitude__isnull=False, longitude__isnull=False):
            distance = self._haversine_km(lat, lng, place.latitude, place.longitude)
            if distance <= radius_km:
                ids.append(place.id)
        return queryset.filter(id__in=ids)

    def _haversine_km(self, lat1, lng1, lat2, lng2):
        # Approximate distance between two lat/lng points in km
        r = 6371  # Earth radius in km
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        d_phi = math.radians(lat2 - lat1)
        d_lambda = math.radians(lng2 - lng1)
        a = (
            math.sin(d_phi / 2) ** 2
            + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return r * c

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def auto_translate(self, request, pk=None):
        """
        Auto-translate place to all configured languages using LLM.
        """
        place = self.get_object()

        source_lang = request.data.get("source_lang", settings.LANGUAGE_CODE)
        configured_langs = [lang[0] for lang in settings.LANGUAGES]
        default_targets = [lang for lang in configured_langs if lang != source_lang]
        target_langs = request.data.get("target_langs", default_targets)

        if source_lang not in place.get_available_languages():
            return Response(
                {
                    "success": False,
                    "error": f"Place has no content in {source_lang} to translate from",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        place.set_current_language(source_lang)
        source_title = place.title
        source_description = place.description or ""

        if not source_title:
            return Response(
                {
                    "success": False,
                    "error": f"Place has no content in {source_lang} to translate from",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from llm_translations.utils import TranslationError, translate_text
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

                translated_description = ""
                if source_description:
                    translated_description = translate_text(
                        text=source_description,
                        source_lang=source_lang,
                        target_lang=target_lang,
                        log_translation=True,
                    )

                place.set_current_language(target_lang, initialize=True)
                place.title = translated_title
                place.description = translated_description
                place.save_translations()

                translations[target_lang] = {
                    "title": translated_title,
                    "description": translated_description,
                }

                logger.info(
                    f"Translated place {place.id} to {target_lang}: '{translated_title}'"
                )

            except TranslationError as e:
                error_msg = str(e)
                errors[target_lang] = error_msg
                logger.error(
                    f"Failed to translate place {place.id} to {target_lang}: {error_msg}"
                )
            except Exception as e:
                error_msg = f"Unexpected error: {str(e)}"
                errors[target_lang] = error_msg
                logger.exception(
                    f"Unexpected error translating place {place.id} to {target_lang}"
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


class RestaurantViewSet(PlaceViewSet):
    """
    API endpoints for restaurants.
    """

    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer

    def get_serializer_class(self):
        # We don't have a specific detail serializer yet, but we could add one
        # For now, reuse the list serializer which has all fields
        return RestaurantSerializer


class AccommodationViewSet(PlaceViewSet):
    """
    API endpoints for accommodations.
    """

    queryset = Accommodation.objects.all()
    serializer_class = AccommodationSerializer

    def get_serializer_class(self):
        return AccommodationSerializer
