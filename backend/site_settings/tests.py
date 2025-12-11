from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from site_settings.models import SiteSettings

User = get_user_model()

pytestmark = pytest.mark.django_db


@pytest.fixture
def auth_client():
    user = User.objects.create_user(username="settings", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def test_get_site_settings_public():
    settings_obj = SiteSettings.get_solo()
    settings_obj.site_name = "Demo"
    settings_obj.save()

    client = APIClient()
    url = reverse("site-settings-list")
    resp = client.get(url)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.data["site_name"] == "Demo"


def test_update_requires_auth(auth_client):
    url = reverse("site-settings-detail", kwargs={"pk": 1})
    resp = auth_client.patch(url, {"site_name": "Updated"}, format="json")
    assert resp.status_code == status.HTTP_200_OK
    settings_obj = SiteSettings.get_solo()
    assert settings_obj.site_name == "Updated"


def test_update_unauthenticated_forbidden():
    client = APIClient()
    url = reverse("site-settings-list")
    resp = client.patch(url, {"site_name": "Hacker"}, format="json")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
