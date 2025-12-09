"""Anthropic Claude provider for LLM translations."""

from .base import BaseProvider, TranslationResult


class AnthropicProvider(BaseProvider):
    """Anthropic Claude models provider."""
    
    def __init__(self, api_key: str):
        """Initialize Anthropic provider with API key."""
        super().__init__(api_key=api_key)
        try:
            from anthropic import Anthropic
            self.client = Anthropic(api_key=api_key)
        except ImportError:
            raise ImportError("anthropic package not installed. Run: pip install anthropic")
    
    def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        model: str,
        temperature: float = 0.3,
        max_tokens: int = 2000
    ) -> TranslationResult:
        """Translate text using Anthropic Claude API."""
        prompt = self.build_translation_prompt(text, source_lang, target_lang)
        
        response = self.client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=prompt["system"],
            messages=[
                {"role": "user", "content": prompt["user"]}
            ]
        )
        
        translated_text = response.content[0].text.strip()
        tokens_used = response.usage.input_tokens + response.usage.output_tokens
        
        return TranslationResult(
            translated_text=translated_text,
            tokens_used=tokens_used,
            provider="anthropic",
            model=model
        )
