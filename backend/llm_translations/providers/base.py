"""Base provider class and shared utilities for all LLM providers."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class TranslationResult:
    """Result of a translation operation."""
    translated_text: str
    tokens_used: int
    provider: str
    model: str


class BaseProvider(ABC):
    """Base class for all LLM translation providers."""
    
    def __init__(self, api_key: str = None, **kwargs):
        """
        Initialize the provider.
        
        Args:
            api_key: API key for the provider (if required)
            **kwargs: Additional provider-specific configuration
        """
        self.api_key = api_key
        self.config = kwargs
    
    @abstractmethod
    def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        model: str,
        temperature: float = 0.3,
        max_tokens: int = 2000
    ) -> TranslationResult:
        """
        Translate text from source language to target language.
        
        Args:
            text: Text to translate
            source_lang: Source language code (e.g., 'es', 'en')
            target_lang: Target language code
            model: Model identifier to use
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens in response
            
        Returns:
            TranslationResult with translated text and metadata
            
        Raises:
            Exception: If translation fails
        """
        pass
    
    @staticmethod
    def get_language_name(lang_code: str) -> str:
        """Get human-readable language name from code."""
        from django.utils.translation import get_language_info
        try:
            return get_language_info(lang_code)['name']
        except KeyError:
            return lang_code.upper()
    
    @staticmethod
    def build_translation_prompt(text: str, source_lang: str, target_lang: str) -> dict[str, str]:
        """Build standard translation prompt messages."""
        # Map language codes to explicit language names
        lang_names = {
            'es': 'Spanish',
            'en': 'English', 
            'fr': 'French',
            'ca': 'Catalan',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
        }
        
        target_name = lang_names.get(target_lang, target_lang.upper())
        source_name = lang_names.get(source_lang, source_lang.upper())
        
        # Build explicit prompt with strong target language emphasis
        return {
            "system": f"You are a translator. Translate from {source_name} to {target_name}. Output must be in {target_name} only.",
            "user": f"[TARGET LANGUAGE: {target_name}]\n\nTranslate this {source_name} text to {target_name}:\n\n{text}\n\n{target_name} translation:"
        }
