from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category
from site_settings.models import MenuItem, SiteSettings

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
    resp = auth_client.patch(
        url,
        {"site_name": "Updated", "youtube_url": "https://youtu.be/demo", "video_enabled": False},
        format="json",
    )
    assert resp.status_code == status.HTTP_200_OK
    settings_obj = SiteSettings.get_solo()
    assert settings_obj.site_name == "Updated"
    assert settings_obj.youtube_url == "https://youtu.be/demo"
    assert settings_obj.video_enabled is False


def test_update_unauthenticated_forbidden():
    client = APIClient()
    url = reverse("site-settings-list")
    resp = client.patch(url, {"site_name": "Hacker"}, format="json")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


def test_menu_items_public_list_filtered_by_location():
    settings_obj = SiteSettings.get_solo()
    cat = Category.objects.create(slug="routes", nombre="Rutes", taxonomy="nav")
    MenuItem.objects.create(settings=settings_obj, location="header", type="category", category=cat, order=1)
    MenuItem.objects.create(
        settings=settings_obj,
        location="footer",
        type="custom",
        label="Footer link",
        url="https://example.com",
        order=1,
    )

    client = APIClient()
    url = reverse("menu-items-list")
    resp = client.get(url, {"location": "header"})
    assert resp.status_code == status.HTTP_200_OK
    assert len(resp.data) == 1
    assert resp.data[0]["type"] == "category"


def test_create_custom_menu_item_requires_auth_and_fields(auth_client):
    url = reverse("menu-items-list")
    resp = auth_client.post(url, {"type": "custom", "label": "", "url": ""}, format="json")
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "url" in resp.data or "label" in resp.data

    resp_ok = auth_client.post(
        url,
        {"location": "header", "type": "custom", "label": "Comprar", "url": "https://maresme.example/compres"},
        format="json",
    )
    assert resp_ok.status_code == status.HTTP_201_CREATED
    assert resp_ok.data["label"] == "Comprar"


def test_menu_item_max_depth_three_levels(auth_client):
    url = reverse("menu-items-list")
    root = auth_client.post(
        url, {"location": "header", "type": "custom", "label": "Root", "url": "https://example.com"}, format="json"
    ).data
    child = auth_client.post(
        url,
        {
            "location": "header",
            "parent": root["id"],
            "type": "custom",
            "label": "Child",
            "url": "https://example.com/child",
        },
        format="json",
    ).data
    grandchild = auth_client.post(
        url,
        {
            "location": "header",
            "parent": child["id"],
            "type": "custom",
            "label": "Grandchild",
            "url": "https://example.com/grandchild",
        },
        format="json",
    )
    assert grandchild.status_code == status.HTTP_201_CREATED

    too_deep = auth_client.post(
        url,
        {
            "location": "header",
            "parent": grandchild.data["id"],
            "type": "custom",
            "label": "Too deep",
            "url": "https://example.com/deep",
        },
        format="json",
    )
    assert too_deep.status_code == status.HTTP_400_BAD_REQUEST
