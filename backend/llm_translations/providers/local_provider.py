"""Local LLM provider (Ollama, LM Studio, etc.) for translations."""

from .base import BaseProvider, TranslationResult


class LocalProvider(BaseProvider):
    """Local LLM provider using OpenAI-compatible API."""
    
    def __init__(self, base_url: str):
        """
        Initialize Local provider with base URL.
        
        Args:
            base_url: Base URL for local LLM server (e.g., http://localhost:1234)
        """
        super().__init__(api_key="local")
        self.base_url = base_url.rstrip('/')
        
        try:
            from openai import OpenAI
            self.client = OpenAI(
                base_url=f"{self.base_url}/v1",
                api_key="local"  # Dummy key for local models
            )
        except ImportError:
            raise ImportError("openai package not installed. Run: pip install openai")
    
    def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        model: str,
        temperature: float = 0.3,
        max_tokens: int = 2000
    ) -> TranslationResult:
        """Translate text using local LLM via OpenAI-compatible API."""
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
        
        # Local models may not always return token usage
        tokens_used = 0
        if hasattr(response, 'usage') and response.usage:
            tokens_used = response.usage.total_tokens
        
        return TranslationResult(
            translated_text=translated_text,
            tokens_used=tokens_used,
            provider="local",
            model=model
        )
