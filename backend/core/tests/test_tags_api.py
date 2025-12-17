import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Tag

User = get_user_model()

pytestmark = pytest.mark.django_db


@pytest.fixture
def auth_client():
    user = User.objects.create_user(username="tester", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def test_list_and_filter_tags():
    Tag.objects.create(slug="music", nombre="Music")
    Tag.objects.create(slug="family", nombre="Family")

    client = APIClient()
    url = reverse("tag-list")

    resp_all = client.get(url)
    assert resp_all.status_code == status.HTTP_200_OK
    assert len(resp_all.data) == 2

    resp_slug = client.get(url, {"slug": "music"})
    assert resp_slug.status_code == status.HTTP_200_OK
    assert len(resp_slug.data) == 1
    assert resp_slug.data[0]["slug"] == "music"

    resp_search = client.get(url, {"search": "fam"})
    assert resp_search.status_code == status.HTTP_200_OK
    assert len(resp_search.data) == 1
    assert resp_search.data[0]["slug"] == "family"


def test_create_update_delete_tag(auth_client):
    url = reverse("tag-list")
    payload = {
        "slug": "market",
        "nombre": "Market",
        "translations": {
            "es": {"nombre": "Mercado"},
            "ca": {"nombre": "Mercat"},
        },
    }

    resp_create = auth_client.post(url, payload, format="json")
    assert resp_create.status_code == status.HTTP_201_CREATED
    tag_id = resp_create.data["id"]

    detail_url = reverse("tag-detail", kwargs={"pk": tag_id})
    resp_patch = auth_client.patch(detail_url, {"nombre": "Market Updated"}, format="json")
    assert resp_patch.status_code == status.HTTP_200_OK
    assert resp_patch.data["nombre"] == "Market Updated"

    resp_delete = auth_client.delete(detail_url)
    assert resp_delete.status_code == status.HTTP_204_NO_CONTENT
    assert Tag.objects.count() == 0

