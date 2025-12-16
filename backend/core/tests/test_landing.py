from __future__ import annotations

import pytest
from django.templatetags.static import static

pytestmark = pytest.mark.django_db


def test_landing_renders(client):
    resp = client.get("/")
    assert resp.status_code == 200
    content = resp.content.decode("utf-8")
    assert "Gaudeix Codex" in content
    assert static("core/branding/logo-cabrera-white.png") in content
    assert static("core/branding/favicon-16x16.png") in content


def test_static_url_is_absolute(settings):
    assert settings.STATIC_URL.startswith("/")

