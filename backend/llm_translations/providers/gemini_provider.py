"""Google Gemini provider for LLM translations."""

from .base import BaseProvider, TranslationResult


class GeminiProvider(BaseProvider):
    """Google Gemini models provider."""
    
    def __init__(self, api_key: str):
        """Initialize Gemini provider with API key."""
        super().__init__(api_key=api_key)
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            self.genai = genai
        except ImportError:
            raise ImportError("google-generativeai package not installed. Run: pip install google-generativeai")
    
    def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        model: str,
        temperature: float = 0.3,
        max_tokens: int = 2000
    ) -> TranslationResult:
        """Translate text using Google Gemini API."""
        source_name = self.get_language_name(source_lang)
        target_name = self.get_language_name(target_lang)
        
        model_instance = self.genai.GenerativeModel(model)
        prompt = f"Translate the following text from {source_name} to {target_name}. Provide ONLY the translation, no explanations.\n\n{text}"
        
        response = model_instance.generate_content(
            prompt,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            }
        )
        
        translated_text = response.text.strip()
        
        # Gemini token usage handling
        usage_metadata = getattr(response, 'usage_metadata', None)
        tokens_used = usage_metadata.total_token_count if usage_metadata else 0
        
        return TranslationResult(
            translated_text=translated_text,
            tokens_used=tokens_used,
            provider="gemini",
            model=model
        )
