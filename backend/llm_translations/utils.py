"""
Utility functions for LLM translation services.

This module provides a clean interface for translating text using various LLM providers.
All provider-specific logic is contained in the providers/ package for better modularity.
"""

from __future__ import annotations

import logging

from django.conf import settings

from .models import LLMProviderConfig, TranslationLog
from .providers import (
    BaseProvider,
    OpenRouterProvider,
    GeminiProvider,
    TranslationResult,
)

logger = logging.getLogger(__name__)


class TranslationError(Exception):
    """Custom exception for translation errors."""
    pass


def get_provider(provider_name: str, config: LLMProviderConfig) -> BaseProvider:
    """
    Factory function to instantiate the appropriate LLM provider.
    
    Args:
        provider_name: Provider identifier (from LLMProviderConfig.Provider choices)
        config: LLM configuration object
        
    Returns:
        Initialized provider instance
        
    Raises:
        TranslationError: If provider is not supported or configuration is missing
    """
    match provider_name:
        case LLMProviderConfig.Provider.OPENROUTER:
            api_key = config.openrouter_api_key or settings.LLM_OPENROUTER_API_KEY
            if not api_key:
                raise TranslationError("OpenRouter API key not configured")
            return OpenRouterProvider(api_key=api_key)
        
        case LLMProviderConfig.Provider.GEMINI:
            api_key = config.gemini_api_key or settings.LLM_GEMINI_API_KEY
            if not api_key:
                raise TranslationError("Gemini API key not configured")
            return GeminiProvider(api_key=api_key)

        case _:
            raise TranslationError(f"Unsupported provider: {provider_name}")


def translate_text(
    text: str,
    source_lang: str,
    target_lang: str,
    log_translation: bool = True
) -> str:
    """
    Translate text from source language to target language using configured LLM provider.
    
    This is the main translation function that should be used throughout the application.
    It handles provider instantiation, translation execution, and logging automatically.
    
    Args:
        text: Text to translate
        source_lang: Source language code (e.g., 'ca', 'es', 'en', 'fr')
        target_lang: Target language code
        log_translation: Whether to log the translation to TranslationLog model
        
    Returns:
        Translated text as string
        
    Raises:
        TranslationError: If translation fails or LLM is not configured properly
        
    Example:
        >>> translated = translate_text("Hola mundo", "es", "en")
        >>> print(translated)
        "Hello world"
    """
    # Get current configuration
    config = LLMProviderConfig.get_config()
    
    if not config.is_active:
        raise TranslationError("LLM translation is currently disabled in configuration")
    
    provider_name = config.provider
    model = config.model_name
    temperature = config.temperature
    max_tokens = config.max_tokens
    
    logger.info(
        f"Translating text ({len(text)} chars) from '{source_lang}' to '{target_lang}' "
        f"using {provider_name}/{model}"
    )
    
    try:
        # Instantiate the appropriate provider
        provider = get_provider(provider_name, config)
        
        # Perform translation
        result: TranslationResult = provider.translate(
            text=text,
            source_lang=source_lang,
            target_lang=target_lang,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        # Log successful translation
        if log_translation:
            TranslationLog.objects.create(
                provider=result.provider,
                model_name=result.model,
                source_text=text,
                translated_text=result.translated_text,
                source_language=source_lang,
                target_language=target_lang,
                tokens_used=result.tokens_used,
                success=True,
            )
        
        logger.info(
            f"Translation successful: {result.tokens_used} tokens used, "
            f"output length: {len(result.translated_text)} chars"
        )
        
        return result.translated_text
        
    except TranslationError:
        # Re-raise TranslationError as-is
        raise
    
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Translation failed: {error_msg}", exc_info=True)
        
        # Log failed translation
        if log_translation:
            TranslationLog.objects.create(
                provider=provider_name,
                model_name=model,
                source_text=text,
                translated_text="",
                source_language=source_lang,
                target_language=target_lang,
                success=False,
                error_message=error_msg[:500],  # Truncate long errors
            )
        
        raise TranslationError(f"Translation failed: {error_msg}")


# Export public API
__all__ = [
    'TranslationError',
    'get_provider',
    'translate_text',
]
