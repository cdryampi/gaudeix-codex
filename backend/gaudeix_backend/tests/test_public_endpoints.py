from __future__ import annotations

import pytest

pytestmark = pytest.mark.django_db


def test_health_check_ok(client):
    resp = client.get("/api/health/")
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["status"] == "online"
    assert payload["service"] == "Gaudeix Backend"


def test_schema_endpoints(client):
    assert client.get("/api/schema/").status_code == 200
    assert client.get("/api/schema/swagger-ui/").status_code in {200, 302}
    assert client.get("/api/schema/redoc/").status_code in {200, 302}

