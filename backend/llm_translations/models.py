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

        OPENROUTER = "openrouter", _("OpenRouter")
        GEMINI = "gemini", _("Google Gemini")

    class Model(models.TextChoices):
        """Supported LLM models."""

        # OpenRouter models
        OPENROUTER_FREE = "openrouter/free", _("OpenRouter Free")

        # Gemini models
        GEMINI_2_FLASH = "gemini-2.0-flash-exp", _("Gemini 2.0 Flash")
        GEMINI_PRO = "gemini-1.5-pro", _("Gemini 1.5 Pro")

    provider = models.CharField(
        _("Provider"),
        max_length=20,
        choices=Provider.choices,
        default=Provider.OPENROUTER,
        help_text=_("LLM provider to use for translations"),
    )

    model_name = models.CharField(
        _("Model Name"),
        max_length=50,
        choices=Model.choices,
        default=Model.OPENROUTER_FREE,
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

    openrouter_api_key = models.TextField(
        _("OpenRouter API Key"),
        blank=True,
        default="",
        help_text=_("Optional. Overrides LLM_OPENROUTER_API_KEY env var."),
    )

    gemini_api_key = models.TextField(
        _("Gemini API Key"),
        blank=True,
        default="",
        help_text=_("Optional. Overrides LLM_GEMINI_API_KEY env var."),
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
