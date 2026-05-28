"""Tests for LLM translation utilities and integration with Places auto_translate."""

from __future__ import annotations

import sys
import types

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from llm_translations.models import LLMProviderConfig, TranslationLog
from llm_translations.utils import TranslationError, translate_text
from llm_translations.providers.base import TranslationResult
from core.models import Category
from places.models import Place, PlaceCategorySingleton

User = get_user_model()

pytestmark = pytest.mark.django_db


@pytest.fixture
def openrouter_config():
    config = LLMProviderConfig.get_solo()
    config.provider = LLMProviderConfig.Provider.OPENROUTER
    config.model_name = LLMProviderConfig.Model.OPENROUTER_FREE
    config.is_active = True
    config.temperature = 0.3
    config.max_tokens = 2000
    config.save()
    return config


class TestTranslateText:
    def test_translate_text_success_logs(self, openrouter_config, monkeypatch):
        """translate_text should call provider and log success."""

        class FakeProvider:
            def translate(
                self, text, source_lang, target_lang, model, temperature, max_tokens
            ):
                return TranslationResult(
                    translated_text=f"{text}-{target_lang}",
                    tokens_used=42,
                    provider="openrouter",
                    model=model,
                )

        monkeypatch.setattr(
            "llm_translations.utils.get_provider",
            lambda provider_name, config: FakeProvider(),
        )

        result = translate_text("Hola", "es", "en", log_translation=True)

        assert result == "Hola-en"
        assert TranslationLog.objects.count() == 1
        log = TranslationLog.objects.first()
        assert log.success is True
        assert log.translated_text == "Hola-en"
        assert log.tokens_used == 42

    def test_translate_text_disabled_raises(self, openrouter_config, monkeypatch):
        openrouter_config.is_active = False
        openrouter_config.save()

        with pytest.raises(
            TranslationError, match="LLM translation is currently disabled"
        ):
            translate_text("Test", "ca", "en")

    def test_translate_text_logs_error(self, openrouter_config, monkeypatch):
        class FakeProvider:
            def translate(self, *args, **kwargs):
                raise RuntimeError("LLM down")

        monkeypatch.setattr(
            "llm_translations.utils.get_provider",
            lambda provider_name, config: FakeProvider(),
        )

        with pytest.raises(TranslationError, match="LLM down"):
            translate_text("Test error", "ca", "en", log_translation=True)

        assert TranslationLog.objects.count() == 1
        log = TranslationLog.objects.first()
        assert log.success is False
        assert log.error_message.startswith("LLM down")


class TestPlaceAutoTranslateIntegration:
    """Ensure Place auto_translate uses LLM utils and only translates content fields."""

    @pytest.fixture
    def auth_client(self):
        user = User.objects.create_user(username="translator", password="pass123")
        client = APIClient()
        client.force_authenticate(user=user)
        return client

    @pytest.fixture
    def place_with_category(self):
        category = Category.objects.create(slug="places", nombre="Places")
        PlaceCategorySingleton.objects.create(category=category)
        place = Place.objects.create(
            title="Casa",
            description="Bonita casa",
            latitude=1.0,
            longitude=1.0,
            category=category,
        )
        return place

    def test_place_auto_translate_translates_title_and_description_only(
        self, auth_client, place_with_category, monkeypatch
    ):
        calls = []

        def fake_translate_text(text, source_lang, target_lang, log_translation=True):
            calls.append(text)
            return f"{text}-{target_lang}"

        class FakeTranslationError(Exception):
            pass

        fake_module = types.SimpleNamespace(
            translate_text=fake_translate_text, TranslationError=FakeTranslationError
        )
        monkeypatch.setitem(sys.modules, "llm_translations.utils", fake_module)

        url = reverse("place-auto-translate", kwargs={"slug": place_with_category.slug})
        resp = auth_client.post(
            url, {"source_lang": "ca", "target_langs": ["en"]}, format="json"
        )

        assert resp.status_code == 200
        assert calls == ["Casa", "Bonita casa"]

        place_with_category.set_current_language("en")
        place_with_category.refresh_from_db()
        assert place_with_category.title == "Casa-en"
        assert place_with_category.description == "Bonita casa-en"


# =============================================================================
# GROQ INTEGRATION TESTS (Real API calls - require GROQ_API_KEY)
# =============================================================================


@pytest.fixture
def groq_config():
    """Configure LLM to use Groq provider with Llama 3.1 8B Instant model."""
    config = LLMProviderConfig.get_solo()
    config.provider = LLMProviderConfig.Provider.GROQ
    config.model_name = LLMProviderConfig.Model.LLAMA_3_8B_INSTANT
    config.is_active = True
    config.temperature = 0.3
    config.max_tokens = 500
    config.save()
    return config


@pytest.mark.skip(reason="Groq provider removed; OpenRouter and Gemini are supported")
@pytest.mark.skipif(
    not pytest.importorskip("groq", reason="groq package not installed"),
    reason="groq package not installed",
)
class TestGroqIntegration:
    """
    Integration tests for Groq LLM provider with real API calls.

    These tests require:
    - GROQ_API_KEY environment variable or config.groq_api_key set
    - Network connectivity to Groq API

    Run with: pytest llm_translations/tests.py::TestGroqIntegration -v
    Skip with: pytest llm_translations/tests.py -k "not Groq"
    """

    def test_groq_translate_catalan_to_english(self, groq_config):
        """Test real translation from Catalan to English using Groq."""
        import os
        from django.conf import settings

        # Skip if no API key configured (check env, config, and settings)
        api_key = (
            os.environ.get("LLM_GROQ_API_KEY", "")
            or os.environ.get("GROQ_API_KEY", "")
            or groq_config.groq_api_key
            or getattr(settings, "LLM_GROQ_API_KEY", "")
        )
        if not api_key:
            pytest.skip("LLM_GROQ_API_KEY not configured")

        result = translate_text(
            text="Bon dia, com estàs?",
            source_lang="ca",
            target_lang="en",
            log_translation=True,
        )

        # Verify translation contains expected English words
        result_lower = result.lower()
        assert any(
            word in result_lower for word in ["good", "morning", "hello", "hi", "how"]
        ), f"Translation doesn't look like English: {result}"

        # Verify logging
        log = TranslationLog.objects.filter(success=True).last()
        assert log is not None
        assert log.provider == "groq"
        assert "llama" in log.model_name.lower()
        assert log.tokens_used > 0

    def test_groq_translate_spanish_to_french(self, groq_config):
        """Test real translation from Spanish to French using Groq."""
        import os
        from django.conf import settings

        api_key = (
            os.environ.get("LLM_GROQ_API_KEY", "")
            or os.environ.get("GROQ_API_KEY", "")
            or groq_config.groq_api_key
            or getattr(settings, "LLM_GROQ_API_KEY", "")
        )
        if not api_key:
            pytest.skip("LLM_GROQ_API_KEY not configured")

        result = translate_text(
            text="La biblioteca municipal abre todos los días.",
            source_lang="es",
            target_lang="fr",
            log_translation=True,
        )

        # Verify translation contains expected French words
        result_lower = result.lower()
        assert any(
            word in result_lower
            for word in ["bibliothèque", "municipale", "ouvre", "jours"]
        ), f"Translation doesn't look like French: {result}"

    def test_groq_translate_preserves_formatting(self, groq_config):
        """Test that Groq preserves basic text formatting in translations."""
        import os
        from django.conf import settings

        api_key = (
            os.environ.get("LLM_GROQ_API_KEY", "")
            or os.environ.get("GROQ_API_KEY", "")
            or groq_config.groq_api_key
            or getattr(settings, "LLM_GROQ_API_KEY", "")
        )
        if not api_key:
            pytest.skip("LLM_GROQ_API_KEY not configured")

        # Text with line break
        result = translate_text(
            text="Horario:\nLunes a viernes: 9:00 - 14:00",
            source_lang="es",
            target_lang="en",
            log_translation=False,
        )

        # Should preserve some structure (either newline or colon formatting)
        assert ":" in result or "\n" in result, (
            f"Formatting lost in translation: {result}"
        )
        # Should contain time-related content
        assert any(c.isdigit() for c in result), (
            f"Numbers lost in translation: {result}"
        )

    def test_groq_handles_special_characters(self, groq_config):
        """Test Groq handles special Catalan/Spanish characters correctly."""
        import os
        from django.conf import settings

        api_key = (
            os.environ.get("LLM_GROQ_API_KEY", "")
            or os.environ.get("GROQ_API_KEY", "")
            or groq_config.groq_api_key
            or getattr(settings, "LLM_GROQ_API_KEY", "")
        )
        if not api_key:
            pytest.skip("LLM_GROQ_API_KEY not configured")

        # Text with special characters: ç, ñ, accents
        result = translate_text(
            text="El niño pequeño jugaba en la plaça.",
            source_lang="es",
            target_lang="en",
            log_translation=False,
        )

        # Should produce readable English
        result_lower = result.lower()
        assert any(
            word in result_lower
            for word in [
                "child",
                "boy",
                "kid",
                "small",
                "little",
                "play",
                "square",
                "plaza",
            ]
        ), f"Translation failed for special chars: {result}"

    def test_groq_model_llama_70b(self):
        """Test with Llama 3.3 70B model (larger, more accurate)."""
        import os
        from django.conf import settings

        config = LLMProviderConfig.get_solo()
        config.provider = LLMProviderConfig.Provider.GROQ
        config.model_name = LLMProviderConfig.Model.LLAMA_3_3_70B
        config.is_active = True
        config.temperature = 0.2
        config.max_tokens = 500
        config.save()

        api_key = (
            os.environ.get("LLM_GROQ_API_KEY", "")
            or os.environ.get("GROQ_API_KEY", "")
            or config.groq_api_key
            or getattr(settings, "LLM_GROQ_API_KEY", "")
        )
        if not api_key:
            pytest.skip("LLM_GROQ_API_KEY not configured")

        result = translate_text(
            text="L'Ajuntament de Cabrera de Mar us dóna la benvinguda.",
            source_lang="ca",
            target_lang="en",
            log_translation=True,
        )

        # Should produce quality English translation
        result_lower = result.lower()
        assert any(
            word in result_lower
            for word in ["town", "city", "council", "hall", "cabrera", "welcome"]
        ), f"70B model translation seems off: {result}"

        # Verify log shows 70B model
        log = TranslationLog.objects.filter(success=True).last()
        assert "70b" in log.model_name.lower()
