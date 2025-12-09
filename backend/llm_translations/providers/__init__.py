"""
LLM Translation Providers

This package contains modular implementations for each LLM provider.
Each provider module exports a translate() function with the same signature.
"""

from .base import BaseProvider, TranslationResult
from .openai_provider import OpenAIProvider
from .gemini_provider import GeminiProvider
from .anthropic_provider import AnthropicProvider
from .mistral_provider import MistralProvider
from .groq_provider import GroqProvider
from .local_provider import LocalProvider

__all__ = [
    'BaseProvider',
    'TranslationResult',
    'OpenAIProvider',
    'GeminiProvider',
    'AnthropicProvider',
    'MistralProvider',
    'GroqProvider',
    'LocalProvider',
]
