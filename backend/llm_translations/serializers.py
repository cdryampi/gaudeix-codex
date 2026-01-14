"""Serializers for LLM translation API endpoints."""

from __future__ import annotations

from django.conf import settings
from rest_framework import serializers
from rest_framework.fields import empty

from .models import LLMProviderConfig, TranslationLog


class LLMProviderConfigSerializer(serializers.ModelSerializer):
    """Serializer for LLM provider configuration."""
    
    provider_display = serializers.CharField(source='get_provider_display', read_only=True)
    model_display = serializers.CharField(source='get_model_name_display', read_only=True)
    api_key = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    credentials_configured = serializers.SerializerMethodField()
    credentials_source = serializers.SerializerMethodField()
    credentials = serializers.SerializerMethodField()

    openai_api_key = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    gemini_api_key = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    anthropic_api_key = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    mistral_api_key = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    groq_api_key = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    
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
            'local_api_url',
            'api_key',
            'openai_api_key',
            'gemini_api_key',
            'anthropic_api_key',
            'mistral_api_key',
            'groq_api_key',
            'credentials_configured',
            'credentials_source',
            'credentials',
        ]
        read_only_fields = ['id']
    
    def validate_temperature(self, value):
        """Ensure temperature is within valid range."""
        if not 0.0 <= value <= 2.0:
            raise serializers.ValidationError("Temperature must be between 0.0 and 2.0")
        return value

    def get_credentials_configured(self, obj: LLMProviderConfig) -> bool:
        provider = obj.provider
        match provider:
            case LLMProviderConfig.Provider.OPENAI:
                return bool(obj.openai_api_key or settings.LLM_OPENAI_API_KEY)
            case LLMProviderConfig.Provider.GEMINI:
                return bool(obj.gemini_api_key or settings.LLM_GEMINI_API_KEY)
            case LLMProviderConfig.Provider.ANTHROPIC:
                return bool(obj.anthropic_api_key or settings.LLM_ANTHROPIC_API_KEY)
            case LLMProviderConfig.Provider.MISTRAL:
                return bool(obj.mistral_api_key or settings.LLM_MISTRAL_API_KEY)
            case LLMProviderConfig.Provider.GROQ:
                return bool(obj.groq_api_key or settings.LLM_GROQ_API_KEY)
            case LLMProviderConfig.Provider.LOCAL:
                return bool(obj.local_api_url or settings.LLM_LOCAL_API_URL)
            case _:
                return False

    def get_credentials_source(self, obj: LLMProviderConfig) -> str | None:
        provider = obj.provider
        match provider:
            case LLMProviderConfig.Provider.OPENAI:
                return "db" if obj.openai_api_key else ("env" if settings.LLM_OPENAI_API_KEY else None)
            case LLMProviderConfig.Provider.GEMINI:
                return "db" if obj.gemini_api_key else ("env" if settings.LLM_GEMINI_API_KEY else None)
            case LLMProviderConfig.Provider.ANTHROPIC:
                return "db" if obj.anthropic_api_key else ("env" if settings.LLM_ANTHROPIC_API_KEY else None)
            case LLMProviderConfig.Provider.MISTRAL:
                return "db" if obj.mistral_api_key else ("env" if settings.LLM_MISTRAL_API_KEY else None)
            case LLMProviderConfig.Provider.GROQ:
                return "db" if obj.groq_api_key else ("env" if settings.LLM_GROQ_API_KEY else None)
            case LLMProviderConfig.Provider.LOCAL:
                return "db" if obj.local_api_url else ("env" if settings.LLM_LOCAL_API_URL else None)
            case _:
                return None

    def _provider_credentials(self, obj: LLMProviderConfig, provider: str) -> dict:
        match provider:
            case LLMProviderConfig.Provider.OPENAI:
                configured = bool(obj.openai_api_key or settings.LLM_OPENAI_API_KEY)
                source = "db" if obj.openai_api_key else ("env" if settings.LLM_OPENAI_API_KEY else None)
            case LLMProviderConfig.Provider.GEMINI:
                configured = bool(obj.gemini_api_key or settings.LLM_GEMINI_API_KEY)
                source = "db" if obj.gemini_api_key else ("env" if settings.LLM_GEMINI_API_KEY else None)
            case LLMProviderConfig.Provider.ANTHROPIC:
                configured = bool(obj.anthropic_api_key or settings.LLM_ANTHROPIC_API_KEY)
                source = "db" if obj.anthropic_api_key else ("env" if settings.LLM_ANTHROPIC_API_KEY else None)
            case LLMProviderConfig.Provider.MISTRAL:
                configured = bool(obj.mistral_api_key or settings.LLM_MISTRAL_API_KEY)
                source = "db" if obj.mistral_api_key else ("env" if settings.LLM_MISTRAL_API_KEY else None)
            case LLMProviderConfig.Provider.GROQ:
                configured = bool(obj.groq_api_key or settings.LLM_GROQ_API_KEY)
                source = "db" if obj.groq_api_key else ("env" if settings.LLM_GROQ_API_KEY else None)
            case LLMProviderConfig.Provider.LOCAL:
                configured = bool(obj.local_api_url or settings.LLM_LOCAL_API_URL)
                source = "db" if obj.local_api_url else ("env" if settings.LLM_LOCAL_API_URL else None)
            case _:
                configured = False
                source = None

        return {"configured": configured, "source": source}

    def get_credentials(self, obj: LLMProviderConfig) -> dict:
        return {
            "openai": self._provider_credentials(obj, LLMProviderConfig.Provider.OPENAI),
            "gemini": self._provider_credentials(obj, LLMProviderConfig.Provider.GEMINI),
            "anthropic": self._provider_credentials(obj, LLMProviderConfig.Provider.ANTHROPIC),
            "mistral": self._provider_credentials(obj, LLMProviderConfig.Provider.MISTRAL),
            "groq": self._provider_credentials(obj, LLMProviderConfig.Provider.GROQ),
            "local": self._provider_credentials(obj, LLMProviderConfig.Provider.LOCAL),
        }

    def update(self, instance: LLMProviderConfig, validated_data):
        api_key = validated_data.pop("api_key", empty)
        provider = validated_data.get("provider", instance.provider)

        for field in (
            "openai_api_key",
            "gemini_api_key",
            "anthropic_api_key",
            "mistral_api_key",
            "groq_api_key",
        ):
            if field in validated_data:
                validated_data[field] = (validated_data[field] or "").strip()

        if "local_api_url" in validated_data:
            validated_data["local_api_url"] = (validated_data["local_api_url"] or "").strip()

        if api_key is not empty:
            normalized_key = (api_key or "").strip()
            match provider:
                case LLMProviderConfig.Provider.OPENAI:
                    instance.openai_api_key = normalized_key
                case LLMProviderConfig.Provider.GEMINI:
                    instance.gemini_api_key = normalized_key
                case LLMProviderConfig.Provider.ANTHROPIC:
                    instance.anthropic_api_key = normalized_key
                case LLMProviderConfig.Provider.MISTRAL:
                    instance.mistral_api_key = normalized_key
                case LLMProviderConfig.Provider.GROQ:
                    instance.groq_api_key = normalized_key
                case LLMProviderConfig.Provider.LOCAL:
                    raise serializers.ValidationError({"api_key": "Local provider does not use an API key"})
                case _:
                    raise serializers.ValidationError({"provider": "Unsupported provider"})

        return super().update(instance, validated_data)


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
    
    original_text = serializers.CharField()
    translated_text = serializers.CharField()
    source_lang = serializers.CharField()
    target_lang = serializers.CharField()
    provider = serializers.CharField()
    model = serializers.CharField()
    success = serializers.BooleanField()
    error_message = serializers.CharField(required=False, allow_blank=True)


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
