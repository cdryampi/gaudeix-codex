"""Serializers for LLM translation API endpoints."""

from __future__ import annotations

from rest_framework import serializers

from .models import LLMProviderConfig, TranslationLog


class LLMProviderConfigSerializer(serializers.ModelSerializer):
    """Serializer for LLM provider configuration."""
    
    provider_display = serializers.CharField(source='get_provider_display', read_only=True)
    model_display = serializers.CharField(source='get_model_name_display', read_only=True)
    
    class Meta:
        model = LLMProviderConfig
        fields = [
            'id',
            'provider',
            'provider_display',
            'model_name',
            'model_display',
            'is_active',
            'temperature',
            'max_tokens',
        ]
        read_only_fields = ['id']
    
    def validate_temperature(self, value):
        """Ensure temperature is within valid range."""
        if not 0.0 <= value <= 2.0:
            raise serializers.ValidationError("Temperature must be between 0.0 and 2.0")
        return value


class TranslateRequestSerializer(serializers.Serializer):
    """Serializer for translation request input."""
    
    text = serializers.CharField(
        required=True,
        allow_blank=False,
        help_text="Text to translate"
    )
    
    source_lang = serializers.CharField(
        required=True,
        max_length=10,
        help_text="Source language code (e.g., 'ca', 'es', 'en', 'fr')"
    )
    
    target_lang = serializers.CharField(
        required=True,
        max_length=10,
        help_text="Target language code (e.g., 'ca', 'es', 'en', 'fr')"
    )
    
    log_translation = serializers.BooleanField(
        default=True,
        required=False,
        help_text="Whether to log this translation request"
    )
    
    def validate(self, data):
        """Validate that source and target languages are different."""
        if data['source_lang'] == data['target_lang']:
            raise serializers.ValidationError({
                'target_lang': 'Target language must be different from source language'
            })
        
        # Validate language codes are in configured languages
        from django.conf import settings
        configured_langs = [lang[0] for lang in settings.LANGUAGES]
        
        if data['source_lang'] not in configured_langs:
            raise serializers.ValidationError({
                'source_lang': f'Language not configured. Available: {", ".join(configured_langs)}'
            })
        
        if data['target_lang'] not in configured_langs:
            raise serializers.ValidationError({
                'target_lang': f'Language not configured. Available: {", ".join(configured_langs)}'
            })
        
        return data


class TranslateResponseSerializer(serializers.Serializer):
    """Serializer for translation response output."""
    
    original_text = serializers.CharField(read_only=True)
    translated_text = serializers.CharField(read_only=True)
    source_lang = serializers.CharField(read_only=True)
    target_lang = serializers.CharField(read_only=True)
    provider = serializers.CharField(read_only=True)
    model = serializers.CharField(read_only=True)
    success = serializers.BooleanField(read_only=True)
    error_message = serializers.CharField(read_only=True, required=False)


class TranslationLogSerializer(serializers.ModelSerializer):
    """Serializer for translation logs."""
    
    provider_display = serializers.CharField(source='get_provider_display', read_only=True)
    
    class Meta:
        model = TranslationLog
        fields = [
            'id',
            'provider',
            'provider_display',
            'model_name',
            'source_text',
            'translated_text',
            'source_language',
            'target_language',
            'tokens_used',
            'cost_estimate',
            'success',
            'error_message',
            'created_at',
        ]
        read_only_fields = fields
