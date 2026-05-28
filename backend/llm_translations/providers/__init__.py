"""
LLM Translation Providers

This package contains modular implementations for each LLM provider.
Each provider module exports a translate() function with the same signature.
"""

from .base import BaseProvider, TranslationResult
from .openrouter_provider import OpenRouterProvider
from .gemini_provider import GeminiProvider

__all__ = [
    'BaseProvider',
    'TranslationResult',
    'OpenRouterProvider',
    'GeminiProvider',
]
