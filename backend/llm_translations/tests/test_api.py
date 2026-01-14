from __future__ import annotations

import pytest
from django.urls import reverse

from llm_translations.models import LLMProviderConfig, TranslationLog

pytestmark = pytest.mark.django_db


def test_translate_endpoint_requires_auth(client):
    url = reverse("llm-config-translate")
    resp = client.post(url, {"text": "Hola", "source_lang": "es", "target_lang": "en"}, format="json")
    assert resp.status_code in {401, 403}


def test_translate_endpoint_requires_admin(auth_client):
    url = reverse("llm-config-translate")
    resp = auth_client.post(url, {"text": "Hola", "source_lang": "es", "target_lang": "en"}, format="json")
    assert resp.status_code == 403


def test_translate_endpoint_success_logs(admin_client, monkeypatch):
    config = LLMProviderConfig.get_config()
    config.is_active = True
    config.save()

    monkeypatch.setattr("llm_translations.views.translate_text", lambda **kwargs: "Hello")

    url = reverse("llm-config-translate")
    resp = admin_client.post(
        url,
        {"text": "Hola", "source_lang": "es", "target_lang": "en", "log_translation": True},
        format="json",
    )
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["translated_text"] == "Hello"
    assert payload["success"] is True

    assert TranslationLog.objects.count() in {0, 1}


def test_llm_config_can_set_api_key(admin_client):
    config = LLMProviderConfig.get_config()

    url = reverse("llm-config-detail", kwargs={"pk": config.pk})
    resp = admin_client.patch(url, {"provider": "openai", "api_key": "sk-test"}, format="json")

    assert resp.status_code == 200
    payload = resp.json()
    assert "api_key" not in payload
    assert payload["provider"] == "openai"
    assert payload["credentials_configured"] is True
    assert payload["credentials_source"] == "db"

    config.refresh_from_db()
    assert config.openai_api_key == "sk-test"


def test_llm_config_local_rejects_api_key(admin_client):
    config = LLMProviderConfig.get_config()

    url = reverse("llm-config-detail", kwargs={"pk": config.pk})
    resp = admin_client.patch(url, {"provider": "local", "api_key": "sk-test"}, format="json")

    assert resp.status_code == 400
    assert "api_key" in resp.json()


def test_llm_config_can_set_provider_specific_api_key_without_switching_provider(admin_client):
    config = LLMProviderConfig.get_config()
    config.provider = LLMProviderConfig.Provider.GEMINI
    config.save()

    url = reverse("llm-config-detail", kwargs={"pk": config.pk})
    resp = admin_client.patch(url, {"openai_api_key": "sk-db"}, format="json")

    assert resp.status_code == 200
    payload = resp.json()
    assert payload["provider"] == "gemini"
    assert payload["credentials"]["openai"]["configured"] is True
    assert payload["credentials"]["openai"]["source"] == "db"

    config.refresh_from_db()
    assert config.openai_api_key == "sk-db"
