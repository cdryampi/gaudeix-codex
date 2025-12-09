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
def local_config():
    config = LLMProviderConfig.get_solo()
    config.provider = LLMProviderConfig.Provider.LOCAL
    config.model_name = LLMProviderConfig.Model.MISTRAL_NEMO
    config.is_active = True
    config.temperature = 0.3
    config.max_tokens = 2000
    config.save()
    return config


class TestTranslateText:
    def test_translate_text_success_logs(self, local_config, monkeypatch):
        """translate_text should call provider and log success."""

        class FakeProvider:
            def translate(self, text, source_lang, target_lang, model, temperature, max_tokens):
                return TranslationResult(
                    translated_text=f"{text}-{target_lang}",
                    tokens_used=42,
                    provider="local",
                    model=model,
                )

        monkeypatch.setattr("llm_translations.utils.get_provider", lambda provider_name, config: FakeProvider())

        result = translate_text("Hola", "es", "en", log_translation=True)

        assert result == "Hola-en"
        assert TranslationLog.objects.count() == 1
        log = TranslationLog.objects.first()
        assert log.success is True
        assert log.translated_text == "Hola-en"
        assert log.tokens_used == 42

    def test_translate_text_disabled_raises(self, local_config, monkeypatch):
        local_config.is_active = False
        local_config.save()

        with pytest.raises(TranslationError, match="LLM translation is currently disabled"):
            translate_text("Test", "ca", "en")

    def test_translate_text_logs_error(self, local_config, monkeypatch):
        class FakeProvider:
            def translate(self, *args, **kwargs):
                raise RuntimeError("LLM down")

        monkeypatch.setattr("llm_translations.utils.get_provider", lambda provider_name, config: FakeProvider())

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

        fake_module = types.SimpleNamespace(translate_text=fake_translate_text, TranslationError=FakeTranslationError)
        monkeypatch.setitem(sys.modules, "llm_translations.utils", fake_module)

        url = reverse("place-auto-translate", kwargs={"pk": place_with_category.pk})
        resp = auth_client.post(url, {"source_lang": "ca", "target_langs": ["en"]}, format="json")

        assert resp.status_code == 200
        assert calls == ["Casa", "Bonita casa"]

        place_with_category.set_current_language("en")
        place_with_category.refresh_from_db()
        assert place_with_category.title == "Casa-en"
        assert place_with_category.description == "Bonita casa-en"
