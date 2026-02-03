"""LLM Translation models for AI-powered content translation."""

from __future__ import annotations

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _
from solo.models import SingletonModel


class LLMProviderConfig(SingletonModel):
    """
    Singleton configuration for LLM translation provider.
    Determines which AI model to use for automated translations.
    """

    class Provider(models.TextChoices):
        """Supported LLM providers."""

        OPENAI = "openai", _("OpenAI")
        GEMINI = "gemini", _("Google Gemini")
        ANTHROPIC = "anthropic", _("Anthropic Claude")
        MISTRAL = "mistral", _("Mistral AI")
        GROQ = "groq", _("Groq")
        LOCAL = "local", _("Local LLM (Ollama/LM Studio)")

    class Model(models.TextChoices):
        """Supported LLM models."""

        # OpenAI models
        GPT_4O = "gpt-4o", _("GPT-4o")
        GPT_4O_MINI = "gpt-4o-mini", _("GPT-4o Mini")
        GPT_4_TURBO = "gpt-4-turbo", _("GPT-4 Turbo")

        # Gemini models
        GEMINI_2_FLASH = "gemini-2.0-flash-exp", _("Gemini 2.0 Flash")
        GEMINI_PRO = "gemini-1.5-pro", _("Gemini 1.5 Pro")

        # Anthropic models
        CLAUDE_SONNET = "claude-3-5-sonnet-20241022", _("Claude 3.5 Sonnet")
        CLAUDE_HAIKU = "claude-3-5-haiku-20241022", _("Claude 3.5 Haiku")

        # Mistral models
        MISTRAL_LARGE = "mistral-large-latest", _("Mistral Large")

        # Groq models (production - see console.groq.com/docs/models)
        LLAMA_3_3_70B = "llama-3.3-70b-versatile", _("Llama 3.3 70B")
        LLAMA_3_8B_INSTANT = "llama-3.1-8b-instant", _("Llama 3.1 8B Instant")
        GPT_OSS_120B = "openai/gpt-oss-120b", _("GPT OSS 120B")
        GPT_OSS_20B = "openai/gpt-oss-20b", _("GPT OSS 20B")

        # Local models (Ollama/LM Studio compatible)
        LLAMA_3_8B = "llama3.2:latest", _("Llama 3.2 (Local)")
        MISTRAL_7B = "mistral:latest", _("Mistral 7B (Local)")
        MISTRAL_NEMO = (
            "mistralai/mistral-nemo-instruct-2407",
            _("Mistral Nemo Instruct (Local)"),
        )
        QWEN_7B = "qwen2.5:latest", _("Qwen 2.5 (Local)")
        GEMMA_7B = "gemma2:latest", _("Gemma 2 (Local)")

    provider = models.CharField(
        _("Provider"),
        max_length=20,
        choices=Provider.choices,
        default=Provider.OPENAI,
        help_text=_("LLM provider to use for translations"),
    )

    model_name = models.CharField(
        _("Model Name"),
        max_length=50,
        choices=Model.choices,
        default=Model.GPT_4O_MINI,
        help_text=_("Specific model to use for translations"),
    )

    is_active = models.BooleanField(
        _("Active"),
        default=True,
        help_text=_("Whether LLM translation is currently active"),
    )

    temperature = models.FloatField(
        _("Temperature"),
        default=0.3,
        validators=[MinValueValidator(0.0), MaxValueValidator(2.0)],
        help_text=_(
            "Controls randomness in translations (0.0-2.0, lower is more deterministic)"
        ),
    )

    max_tokens = models.PositiveIntegerField(
        _("Max Tokens"),
        default=2000,
        help_text=_("Maximum tokens for translation output"),
    )

    openai_api_key = models.TextField(
        _("OpenAI API Key"),
        blank=True,
        default="",
        help_text=_("Optional. Overrides LLM_OPENAI_API_KEY env var."),
    )

    gemini_api_key = models.TextField(
        _("Gemini API Key"),
        blank=True,
        default="",
        help_text=_("Optional. Overrides LLM_GEMINI_API_KEY env var."),
    )

    anthropic_api_key = models.TextField(
        _("Anthropic API Key"),
        blank=True,
        default="",
        help_text=_("Optional. Overrides LLM_ANTHROPIC_API_KEY env var."),
    )

    mistral_api_key = models.TextField(
        _("Mistral API Key"),
        blank=True,
        default="",
        help_text=_("Optional. Overrides LLM_MISTRAL_API_KEY env var."),
    )

    groq_api_key = models.TextField(
        _("Groq API Key"),
        blank=True,
        default="",
        help_text=_("Optional. Overrides LLM_GROQ_API_KEY env var."),
    )

    local_api_url = models.URLField(
        _("Local API URL"),
        blank=True,
        default="",
        help_text=_("Optional. Overrides LLM_LOCAL_API_URL env var."),
    )

    class Meta:
        verbose_name = _("LLM Provider Configuration")

    def __str__(self) -> str:
        return f"{self.get_provider_display()} - {self.get_model_name_display()}"

    @classmethod
    def get_config(cls) -> LLMProviderConfig:
        """Get the singleton configuration instance."""
        return cls.get_solo()


class TranslationLog(models.Model):
    """
    Log of translation requests for monitoring and cost tracking.
    """

    provider = models.CharField(
        _("Provider"),
        max_length=20,
        choices=LLMProviderConfig.Provider.choices,
    )

    model_name = models.CharField(
        _("Model Name"),
        max_length=50,
    )

    source_text = models.TextField(
        _("Source Text"),
        help_text=_("Original text that was translated"),
    )

    translated_text = models.TextField(
        _("Translated Text"),
        help_text=_("Resulting translation"),
    )

    source_language = models.CharField(
        _("Source Language"),
        max_length=10,
        help_text=_("Language code of source text"),
    )

    target_language = models.CharField(
        _("Target Language"),
        max_length=10,
        help_text=_("Language code of translated text"),
    )

    tokens_used = models.PositiveIntegerField(
        _("Tokens Used"),
        null=True,
        blank=True,
        help_text=_("Number of tokens consumed in the request"),
    )

    cost_estimate = models.DecimalField(
        _("Cost Estimate"),
        max_digits=10,
        decimal_places=6,
        null=True,
        blank=True,
        help_text=_("Estimated cost in USD"),
    )

    success = models.BooleanField(
        _("Success"),
        default=True,
        help_text=_("Whether the translation was successful"),
    )

    error_message = models.TextField(
        _("Error Message"),
        blank=True,
        help_text=_("Error details if translation failed"),
    )

    created_at = models.DateTimeField(
        _("Created At"),
        auto_now_add=True,
    )

    class Meta:
        verbose_name = _("Translation Log")
        verbose_name_plural = _("Translation Logs")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        status = "✓" if self.success else "✗"
        return f"{status} {self.source_language} → {self.target_language} ({self.provider})"
