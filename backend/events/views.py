from __future__ import annotations

import logging

from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Event
from .serializers import EventDetailSerializer, EventSerializer
from .utils import get_upcoming_events

logger = logging.getLogger(__name__)


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
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
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
        source_lang = request.data.get('source_lang', settings.LANGUAGE_CODE)
        
        # Get target languages (default to all except source)
        configured_langs = [lang[0] for lang in settings.LANGUAGES]
        default_targets = [lang for lang in configured_langs if lang != source_lang]
        target_langs = request.data.get('target_langs', default_targets)
        
        # Validate source language exists
        event.set_current_language(source_lang)
        if not event.title:
            return Response(
                {
                    "success": False,
                    "error": f"Event has no content in {source_lang} to translate from"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        source_title = event.title
        source_description = event.description or ""
        
        # Import translation utility
        try:
            from llm_translations.utils import translate_text, TranslationError
        except ImportError:
            return Response(
                {
                    "success": False,
                    "error": "LLM translation module not available"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
                    log_translation=True
                )
                
                # Translate description if exists
                translated_description = ""
                if source_description:
                    translated_description = translate_text(
                        text=source_description,
                        source_lang=source_lang,
                        target_lang=target_lang,
                        log_translation=True
                    )
                
                # Save translation using parler's translation system
                # Create or update translation for target language
                event.set_current_language(target_lang, initialize=True)
                event.title = translated_title
                event.description = translated_description
                event.save_translations()
                
                translations[target_lang] = {
                    'title': translated_title,
                    'description': translated_description
                }
                
                logger.info(f"Translated event {event.id} to {target_lang}: '{translated_title}'")
                
            except TranslationError as e:
                error_msg = str(e)
                errors[target_lang] = error_msg
                logger.error(f"Failed to translate event {event.id} to {target_lang}: {error_msg}")
            except Exception as e:
                error_msg = f"Unexpected error: {str(e)}"
                errors[target_lang] = error_msg
                logger.exception(f"Unexpected error translating event {event.id} to {target_lang}")
        
        # Return results
        return Response({
            'success': len(errors) == 0,
            'source_lang': source_lang,
            'translations': translations,
            'errors': errors
        }, status=status.HTTP_200_OK if len(errors) == 0 else status.HTTP_207_MULTI_STATUS)
