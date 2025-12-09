"""Groq provider for LLM translations."""

from .base import BaseProvider, TranslationResult


class GroqProvider(BaseProvider):
    """Groq fast inference provider."""
    
    def __init__(self, api_key: str):
        """Initialize Groq provider with API key."""
        super().__init__(api_key=api_key)
        try:
            from groq import Groq
            self.client = Groq(api_key=api_key)
        except ImportError:
            raise ImportError("groq package not installed. Run: pip install groq")
    
    def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        model: str,
        temperature: float = 0.3,
        max_tokens: int = 2000
    ) -> TranslationResult:
        """Translate text using Groq API."""
        prompt = self.build_translation_prompt(text, source_lang, target_lang)
        
        response = self.client.chat.completions.create(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": prompt["system"]},
                {"role": "user", "content": prompt["user"]}
            ]
        )
        
        translated_text = response.choices[0].message.content.strip()
        tokens_used = response.usage.total_tokens
        
        return TranslationResult(
            translated_text=translated_text,
            tokens_used=tokens_used,
            provider="groq",
            model=model
        )
