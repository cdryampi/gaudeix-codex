"""Views for LLM translation API endpoints."""

from __future__ import annotations

import logging

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import LLMProviderConfig, TranslationLog
from .serializers import (
    LLMProviderConfigSerializer,
    TranslateRequestSerializer,
    TranslateResponseSerializer,
    TranslationLogSerializer,
)
from .utils import translate_text, TranslationError

logger = logging.getLogger(__name__)


class LLMProviderConfigViewSet(viewsets.ModelViewSet):
    """
    API endpoints for LLM provider configuration.
    
    Singleton model - only one configuration exists.
    """
    
    queryset = LLMProviderConfig.objects.all()
    serializer_class = LLMProviderConfigSerializer
    
    def get_permissions(self):
        """Authenticated can view; only admins can modify configuration."""
        if self.action in {"list", "retrieve"}:
            return [IsAuthenticated()]
        return [IsAdminUser()]
    
    def list(self, request, *args, **kwargs):
        """Return the singleton configuration as a single object, not a list."""
        config = LLMProviderConfig.get_config()
        serializer = self.get_serializer(config)
        return Response(serializer.data)
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve the singleton configuration."""
        config = LLMProviderConfig.get_config()
        serializer = self.get_serializer(config)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """Update the singleton configuration."""
        config = LLMProviderConfig.get_config()
        serializer = self.get_serializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Prevent deletion of singleton configuration."""
        return Response(
            {"detail": "Cannot delete LLM configuration"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def translate(self, request):
        """
        Translate text using the configured LLM provider.
        
        Request body:
        {
            "text": "Text to translate",
            "source_lang": "ca",
            "target_lang": "en",
            "log_translation": true  // optional, default true
        }
        
        Response:
        {
            "original_text": "...",
            "translated_text": "...",
            "source_lang": "ca",
            "target_lang": "en",
            "provider": "openai",
            "model": "gpt-4o-mini",
            "success": true
        }
        """
        request_serializer = TranslateRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        
        text = request_serializer.validated_data['text']
        source_lang = request_serializer.validated_data['source_lang']
        target_lang = request_serializer.validated_data['target_lang']
        log_translation = request_serializer.validated_data.get('log_translation', True)
        
        config = LLMProviderConfig.get_config()
        
        try:
            translated_text = translate_text(
                text=text,
                source_lang=source_lang,
                target_lang=target_lang,
                log_translation=log_translation,
            )
            
            response_data = {
                'original_text': text,
                'translated_text': translated_text,
                'source_lang': source_lang,
                'target_lang': target_lang,
                'provider': config.provider,
                'model': config.model_name,
                'success': True,
            }
            
            response_serializer = TranslateResponseSerializer(data=response_data)
            response_serializer.is_valid(raise_exception=True)
            
            return Response(response_serializer.data, status=status.HTTP_200_OK)
            
        except TranslationError as e:
            logger.error(f"Translation failed: {str(e)}")
            
            response_data = {
                'original_text': text,
                'translated_text': '',
                'source_lang': source_lang,
                'target_lang': target_lang,
                'provider': config.provider,
                'model': config.model_name,
                'success': False,
                'error_message': str(e),
            }
            
            response_serializer = TranslateResponseSerializer(data=response_data)
            response_serializer.is_valid(raise_exception=True)
            
            return Response(
                response_serializer.data,
                status=status.HTTP_400_BAD_REQUEST
            )


class TranslationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints for viewing translation logs.
    Read-only - logs are created automatically during translation.
    """
    
    queryset = TranslationLog.objects.all()
    serializer_class = TranslationLogSerializer
    
    def get_permissions(self):
        """Only admins can view logs."""
        return [IsAdminUser()]
    
    def get_queryset(self):
        """Filter logs by query parameters."""
        queryset = TranslationLog.objects.all()
        params = self.request.query_params
        
        # Filter by provider
        provider = params.get('provider')
        if provider:
            queryset = queryset.filter(provider=provider)
        
        # Filter by success status
        success = params.get('success')
        if success is not None:
            normalized = success.lower()
            if normalized in {'true', '1', 'yes'}:
                queryset = queryset.filter(success=True)
            elif normalized in {'false', '0', 'no'}:
                queryset = queryset.filter(success=False)
        
        # Filter by language
        source_lang = params.get('source_lang')
        if source_lang:
            queryset = queryset.filter(source_language=source_lang)
        
        target_lang = params.get('target_lang')
        if target_lang:
            queryset = queryset.filter(target_language=target_lang)
        
        return queryset

