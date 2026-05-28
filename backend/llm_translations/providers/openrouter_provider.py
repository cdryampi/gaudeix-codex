"""OpenRouter provider for LLM translations."""

from .base import BaseProvider, TranslationResult


class OpenRouterProvider(BaseProvider):
    """OpenRouter OpenAI-compatible models provider."""

    def __init__(self, api_key: str):
        """Initialize OpenRouter provider with API key."""
        super().__init__(api_key=api_key)
        try:
            from openai import OpenAI

            self.client = OpenAI(
                api_key=api_key,
                base_url="https://openrouter.ai/api/v1",
                default_headers={
                    "HTTP-Referer": "https://cdryampi.github.io/gaudeix-codex/",
                    "X-Title": "Gaudeix Codex",
                },
            )
        except ImportError as exc:
            raise ImportError("openai package not installed. Run: pip install openai") from exc

    def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        model: str,
        temperature: float = 0.3,
        max_tokens: int = 2000,
    ) -> TranslationResult:
        """Translate text using OpenRouter API."""
        prompt = self.build_translation_prompt(text, source_lang, target_lang)

        response = self.client.chat.completions.create(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": prompt["system"]},
                {"role": "user", "content": prompt["user"]},
            ],
        )

        translated_text = (response.choices[0].message.content or "").strip()
        tokens_used = response.usage.total_tokens if response.usage else 0

        return TranslationResult(
            translated_text=translated_text,
            tokens_used=tokens_used,
            provider="openrouter",
            model=model,
        )
