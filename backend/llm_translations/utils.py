"""Utility functions for LLM translation services."""

from __future__ import annotations

import logging
from typing import Any

from django.conf import settings
from django.utils.translation import get_language_info

from .models import LLMProviderConfig, TranslationLog

logger = logging.getLogger(__name__)


class TranslationError(Exception):
    """Custom exception for translation errors."""
    pass


def get_llm_client(provider: str) -> Any:
    """
    Factory function to get the appropriate LLM client based on provider.
    
    Args:
        provider: Provider name (openai, gemini, anthropic, mistral, groq)
        
    Returns:
        Configured client instance for the specified provider
        
    Raises:
        TranslationError: If provider is not supported or API key is missing
    """
    match provider:
        case LLMProviderConfig.Provider.OPENAI:
            if not settings.LLM_OPENAI_API_KEY:
                raise TranslationError("OpenAI API key not configured")
            try:
                from openai import OpenAI
                return OpenAI(api_key=settings.LLM_OPENAI_API_KEY)
            except ImportError:
                raise TranslationError("openai package not installed. Run: pip install openai")
        
        case LLMProviderConfig.Provider.GEMINI:
            if not settings.LLM_GEMINI_API_KEY:
                raise TranslationError("Gemini API key not configured")
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.LLM_GEMINI_API_KEY)
                return genai
            except ImportError:
                raise TranslationError("google-generativeai package not installed. Run: pip install google-generativeai")
        
        case LLMProviderConfig.Provider.ANTHROPIC:
            if not settings.LLM_ANTHROPIC_API_KEY:
                raise TranslationError("Anthropic API key not configured")
            try:
                from anthropic import Anthropic
                return Anthropic(api_key=settings.LLM_ANTHROPIC_API_KEY)
            except ImportError:
                raise TranslationError("anthropic package not installed. Run: pip install anthropic")
        
        case LLMProviderConfig.Provider.MISTRAL:
            if not settings.LLM_MISTRAL_API_KEY:
                raise TranslationError("Mistral API key not configured")
            try:
                from mistralai import Mistral
                return Mistral(api_key=settings.LLM_MISTRAL_API_KEY)
            except ImportError:
                raise TranslationError("mistralai package not installed. Run: pip install mistralai")
        
        case LLMProviderConfig.Provider.GROQ:
            if not settings.LLM_GROQ_API_KEY:
                raise TranslationError("Groq API key not configured")
            try:
                from groq import Groq
                return Groq(api_key=settings.LLM_GROQ_API_KEY)
            except ImportError:
                raise TranslationError("groq package not installed. Run: pip install groq")
        
        case LLMProviderConfig.Provider.LOCAL:
            if not settings.LLM_LOCAL_API_URL:
                raise TranslationError("Local LLM API URL not configured")
            try:
                from openai import OpenAI
                # Use OpenAI-compatible client for Ollama/LM Studio
                return OpenAI(
                    base_url=settings.LLM_LOCAL_API_URL + "/v1",
                    api_key="local"  # Dummy key for local models
                )
            except ImportError:
                raise TranslationError("openai package not installed. Run: pip install openai")
        
        case _:
            raise TranslationError(f"Unsupported provider: {provider}")


def translate_with_openai(client: Any, text: str, source_lang: str, target_lang: str, 
                          model: str, temperature: float, max_tokens: int) -> tuple[str, int]:
    """Translate text using OpenAI API."""
    source_name = get_language_info(source_lang)['name']
    target_name = get_language_info(target_lang)['name']
    
    response = client.chat.completions.create(
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        messages=[
            {
                "role": "system",
                "content": f"You are a professional translator. Translate the following text from {source_name} to {target_name}. Provide ONLY the translation, no explanations."
            },
            {
                "role": "user",
                "content": text
            }
        ]
    )
    
    translated_text = response.choices[0].message.content.strip()
    tokens_used = response.usage.total_tokens
    
    return translated_text, tokens_used


def translate_with_gemini(client: Any, text: str, source_lang: str, target_lang: str,
                          model: str, temperature: float, max_tokens: int) -> tuple[str, int]:
    """Translate text using Google Gemini API."""
    source_name = get_language_info(source_lang)['name']
    target_name = get_language_info(target_lang)['name']
    
    model_instance = client.GenerativeModel(model)
    
    prompt = f"Translate the following text from {source_name} to {target_name}. Provide ONLY the translation, no explanations.\n\n{text}"
    
    response = model_instance.generate_content(
        prompt,
        generation_config={
            "temperature": temperature,
            "max_output_tokens": max_tokens,
        }
    )
    
    translated_text = response.text.strip()
    # Gemini doesn't always return token usage in the same way
    tokens_used = getattr(response, 'usage_metadata', None)
    tokens_used = tokens_used.total_token_count if tokens_used else 0
    
    return translated_text, tokens_used


def translate_with_anthropic(client: Any, text: str, source_lang: str, target_lang: str,
                             model: str, temperature: float, max_tokens: int) -> tuple[str, int]:
    """Translate text using Anthropic Claude API."""
    source_name = get_language_info(source_lang)['name']
    target_name = get_language_info(target_lang)['name']
    
    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        messages=[
            {
                "role": "user",
                "content": f"Translate the following text from {source_name} to {target_name}. Provide ONLY the translation, no explanations.\n\n{text}"
            }
        ]
    )
    
    translated_text = response.content[0].text.strip()
    tokens_used = response.usage.input_tokens + response.usage.output_tokens
    
    return translated_text, tokens_used


def translate_with_mistral(client: Any, text: str, source_lang: str, target_lang: str,
                           model: str, temperature: float, max_tokens: int) -> tuple[str, int]:
    """Translate text using Mistral API."""
    source_name = get_language_info(source_lang)['name']
    target_name = get_language_info(target_lang)['name']
    
    response = client.chat.complete(
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        messages=[
            {
                "role": "system",
                "content": f"You are a professional translator. Translate the following text from {source_name} to {target_name}. Provide ONLY the translation, no explanations."
            },
            {
                "role": "user",
                "content": text
            }
        ]
    )
    
    translated_text = response.choices[0].message.content.strip()
    tokens_used = response.usage.total_tokens
    
    return translated_text, tokens_used


def translate_with_groq(client: Any, text: str, source_lang: str, target_lang: str,
                        model: str, temperature: float, max_tokens: int) -> tuple[str, int]:
    """Translate text using Groq API."""
    source_name = get_language_info(source_lang)['name']
    target_name = get_language_info(target_lang)['name']
    
    response = client.chat.completions.create(
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        messages=[
            {
                "role": "system",
                "content": f"You are a professional translator. Translate the following text from {source_name} to {target_name}. Provide ONLY the translation, no explanations."
            },
            {
                "role": "user",
                "content": text
            }
        ]
    )
    
    translated_text = response.choices[0].message.content.strip()
    tokens_used = response.usage.total_tokens
    
    return translated_text, tokens_used


def translate_with_local(client: Any, text: str, source_lang: str, target_lang: str,
                        model: str, temperature: float, max_tokens: int) -> tuple[str, int]:
    """Translate text using local LLM (Ollama/LM Studio via OpenAI-compatible API)."""
    source_name = get_language_info(source_lang)['name']
    target_name = get_language_info(target_lang)['name']
    
    response = client.chat.completions.create(
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        messages=[
            {
                "role": "system",
                "content": f"You are a professional translator. Translate the following text from {source_name} to {target_name}. Provide ONLY the translation, no explanations."
            },
            {
                "role": "user",
                "content": text
            }
        ]
    )
    
    translated_text = response.choices[0].message.content.strip()
    # Local models may not return token usage
    tokens_used = getattr(response.usage, 'total_tokens', 0) if hasattr(response, 'usage') else 0
    
    return translated_text, tokens_used


def translate_text(text: str, source_lang: str, target_lang: str, 
                   log_translation: bool = True) -> str:
    """
    Translate text from source language to target language using configured LLM provider.
    
    Args:
        text: Text to translate
        source_lang: Source language code (e.g., 'ca', 'es', 'en')
        target_lang: Target language code (e.g., 'ca', 'es', 'en')
        log_translation: Whether to log the translation request
        
    Returns:
        Translated text
        
    Raises:
        TranslationError: If translation fails or LLM is not configured
    """
    config = LLMProviderConfig.get_config()
    
    if not config.is_active:
        raise TranslationError("LLM translation is currently disabled")
    
    provider = config.provider
    model = config.model_name
    temperature = config.temperature
    max_tokens = config.max_tokens
    
    logger.info(f"Translating text from {source_lang} to {target_lang} using {provider}/{model}")
    
    try:
        client = get_llm_client(provider)
        
        # Route to appropriate translation function based on provider
        match provider:
            case LLMProviderConfig.Provider.OPENAI:
                translated_text, tokens_used = translate_with_openai(
                    client, text, source_lang, target_lang, model, temperature, max_tokens
                )
            case LLMProviderConfig.Provider.GEMINI:
                translated_text, tokens_used = translate_with_gemini(
                    client, text, source_lang, target_lang, model, temperature, max_tokens
                )
            case LLMProviderConfig.Provider.ANTHROPIC:
                translated_text, tokens_used = translate_with_anthropic(
                    client, text, source_lang, target_lang, model, temperature, max_tokens
                )
            case LLMProviderConfig.Provider.MISTRAL:
                translated_text, tokens_used = translate_with_mistral(
                    client, text, source_lang, target_lang, model, temperature, max_tokens
                )
            case LLMProviderConfig.Provider.GROQ:
                translated_text, tokens_used = translate_with_groq(
                    client, text, source_lang, target_lang, model, temperature, max_tokens
                )
            case LLMProviderConfig.Provider.LOCAL:
                translated_text, tokens_used = translate_with_local(
                    client, text, source_lang, target_lang, model, temperature, max_tokens
                )
            case _:
                raise TranslationError(f"Translation method not implemented for {provider}")
        
        # Log successful translation
        if log_translation:
            TranslationLog.objects.create(
                provider=provider,
                model_name=model,
                source_text=text,
                translated_text=translated_text,
                source_language=source_lang,
                target_language=target_lang,
                tokens_used=tokens_used,
                success=True,
            )
        
        logger.info(f"Translation successful: {tokens_used} tokens used")
        return translated_text
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Translation failed: {error_msg}")
        
        # Log failed translation
        if log_translation:
            TranslationLog.objects.create(
                provider=provider,
                model_name=model,
                source_text=text,
                translated_text="",
                source_language=source_lang,
                target_language=target_lang,
                success=False,
                error_message=error_msg,
            )
        
        raise TranslationError(f"Translation failed: {error_msg}")
