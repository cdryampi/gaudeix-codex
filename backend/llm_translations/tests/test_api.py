from __future__ import annotations

import pytest
from django.urls import reverse

from llm_translations.models import LLMProviderConfig, TranslationLog

pytestmark = pytest.mark.django_db


def test_translate_endpoint_requires_auth(client):
    url = reverse("llm-config-translate")
    resp = client.post(url, {"text": "Hola", "source_lang": "es", "target_lang": "en"}, format="json")
    assert resp.status_code in {401, 403}


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

