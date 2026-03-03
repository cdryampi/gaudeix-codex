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
from .serializers import RouteSerializer, RouteDetailSerializer, RouteItinerarySerializer


logger = logging.getLogger(__name__)


class RouteViewSet(viewsets.ModelViewSet):
    """API endpoints for routes."""

    queryset = (
        Route.objects.all()
        .select_related("category", "featured_media", "gpx_file")
        .prefetch_related(
            "attachments",
            "tags",
            "gallery",
            "route_waypoints__place",
            "route_checkpoints__image",
        )
    )
    serializer_class = RouteSerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ["list", "retrieve", "itinerary"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return RouteDetailSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        # Always clone queryset to avoid cross-request result caching.
        queryset = self.queryset.all()
        params = self.request.query_params

        if not self.request.user.is_authenticated:
            queryset = queryset.filter(is_published=True)

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

    @action(detail=True, methods=["get"], url_path="itinerary")
    def itinerary(self, request, slug=None):
        route = self.get_object()

        if not route.is_published and not (
            request.user.is_authenticated and request.user.is_staff
        ):
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = RouteItinerarySerializer(route, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["post"],
        url_path="generate_gpx",
        permission_classes=[IsAuthenticated],
    )
    def generate_gpx(self, request, slug=None):
        """
        Generate a GPX file from route points and save it as a DocumentFile.

        Priority order for track points:
        1. Active RouteCheckpoints (have direct lat/lng).
        2. Fallback: start point → RouteWaypoints (via Place) → end point.

        POST /api/v1/routes/{slug}/generate_gpx/

        Returns the updated route serialized data with gpx_file populated.
        """
        import xml.etree.ElementTree as ET
        from django.core.files.base import ContentFile
        from media_files.models import DocumentFile

        route = self.get_object()

        # ── 1. Collect track points ──────────────────────────────────────────
        points: list[dict] = []

        checkpoints = list(
            route.route_checkpoints.filter(is_active=True).order_by("order")
        )
        if checkpoints:
            for cp in checkpoints:
                if cp.latitude is not None and cp.longitude is not None:
                    points.append({
                        "lat": float(cp.latitude),
                        "lon": float(cp.longitude),
                        "name": cp.title or f"Checkpoint {cp.order}",
                    })
        else:
            # Fallback: start → waypoints → end
            if route.start_latitude is not None and route.start_longitude is not None:
                title = route.safe_translation_getter("title", any_language=True) or ""
                points.append({
                    "lat": float(route.start_latitude),
                    "lon": float(route.start_longitude),
                    "name": f"Inici - {title}".strip(" -"),
                })

            for wp in route.route_waypoints.select_related("place").order_by("order"):
                place = wp.place
                if place.latitude is not None and place.longitude is not None:
                    place_title = (
                        place.safe_translation_getter("title", any_language=True) or ""
                    )
                    points.append({
                        "lat": float(place.latitude),
                        "lon": float(place.longitude),
                        "name": place_title,
                    })

            if route.end_latitude is not None and route.end_longitude is not None:
                title = route.safe_translation_getter("title", any_language=True) or ""
                points.append({
                    "lat": float(route.end_latitude),
                    "lon": float(route.end_longitude),
                    "name": f"Fi - {title}".strip(" -"),
                })

        if not points:
            return Response(
                {
                    "error": (
                        "La ruta no té cap punt de coordenades. "
                        "Afegeix checkpoints o waypoints amb lat/lng."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 2. Build GPX 1.1 XML ─────────────────────────────────────────────
        NS = "http://www.topografix.com/GPX/1/1"
        XSI = "http://www.w3.org/2001/XMLSchema-instance"
        SCHEMA_LOC = (
            "http://www.topografix.com/GPX/1/1 "
            "http://www.topografix.com/GPX/1/1/gpx.xsd"
        )

        route_title = route.safe_translation_getter("title", any_language=True) or route.slug

        root = ET.Element(
            f"{{{NS}}}gpx",
            attrib={
                "version": "1.1",
                "creator": "Gaudeix Backoffice",
                f"{{{XSI}}}schemaLocation": SCHEMA_LOC,
            },
        )

        metadata = ET.SubElement(root, f"{{{NS}}}metadata")
        ET.SubElement(metadata, f"{{{NS}}}name").text = route_title

        trk = ET.SubElement(root, f"{{{NS}}}trk")
        ET.SubElement(trk, f"{{{NS}}}name").text = route_title
        trkseg = ET.SubElement(trk, f"{{{NS}}}trkseg")

        for point in points:
            trkpt = ET.SubElement(
                trkseg,
                f"{{{NS}}}trkpt",
                attrib={"lat": str(point["lat"]), "lon": str(point["lon"])},
            )
            ET.SubElement(trkpt, f"{{{NS}}}ele").text = "0"
            if point.get("name"):
                ET.SubElement(trkpt, f"{{{NS}}}name").text = point["name"]

        ET.indent(root, space="  ")
        gpx_bytes = b'<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(
            root, encoding="unicode"
        ).encode("utf-8")

        # ── 3. Save as DocumentFile ──────────────────────────────────────────
        filename = f"{route.slug}.gpx"
        content_file = ContentFile(gpx_bytes, name=filename)

        doc = DocumentFile(
            original_name=filename,
            mime_type="application/gpx+xml",
            size_bytes=len(gpx_bytes),
        )
        doc.file.save(filename, content_file, save=True)

        # Detach old gpx_file if it was auto-generated (same slug name)
        old_gpx = route.gpx_file
        route.gpx_file = doc
        route.save(update_fields=["gpx_file"])

        logger.info(
            "Generated GPX for route %s: %d points, DocumentFile id=%d",
            route.slug,
            len(points),
            doc.pk,
        )

        # Delete old auto-generated document only if it was replaced
        if old_gpx and old_gpx.pk != doc.pk:
            old_name = getattr(old_gpx, "original_name", "")
            if old_name.endswith(".gpx") and old_name == f"{route.slug}.gpx":
                old_gpx.delete()

        serializer = RouteSerializer(
            route, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


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
