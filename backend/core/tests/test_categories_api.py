import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category

User = get_user_model()

pytestmark = pytest.mark.django_db


@pytest.fixture
def auth_client():
    user = User.objects.create_user(username="tester", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def test_list_and_filter_categories():
    Category.objects.create(slug="events", nombre="Events", taxonomy="template")
    Category.objects.create(slug="places", nombre="Places", taxonomy="template")
    Category.objects.create(slug="other", nombre="Other", taxonomy="misc")

    client = APIClient()
    url = reverse("category-list")

    resp_all = client.get(url)
    assert resp_all.status_code == status.HTTP_200_OK
    assert len(resp_all.data) == 3

    resp_taxonomy = client.get(url, {"taxonomy": "template"})
    assert len(resp_taxonomy.data) == 2

    resp_slug = client.get(url, {"slug": "places"})
    assert len(resp_slug.data) == 1
    assert resp_slug.data[0]["slug"] == "places"


def test_create_update_delete_category(auth_client):
    url = reverse("category-list")
    payload = {
        "slug": "beach",
        "taxonomy": "template",
        "icon": "umbrella",
        "nombre": "Beach",
        "descripcion": "Sun and sand",
        "translations": {
            "es": {"nombre": "Playa", "descripcion": "Sol y arena"},
            "ca": {"nombre": "Platja", "descripcion": "Sol i sorra"},
        },
    }

    resp_create = auth_client.post(url, payload, format="json")
    assert resp_create.status_code == status.HTTP_201_CREATED
    category_id = resp_create.data["id"]
    assert resp_create.data["icon"] == "umbrella"

    detail_url = reverse("category-detail", kwargs={"pk": category_id})
    resp_patch = auth_client.patch(detail_url, {"nombre": "Beach Updated", "icon": "flag"}, format="json")
    assert resp_patch.status_code == status.HTTP_200_OK
    assert resp_patch.data["nombre"] == "Beach Updated"
    assert resp_patch.data["icon"] == "flag"

    resp_delete = auth_client.delete(detail_url)
    assert resp_delete.status_code == status.HTTP_204_NO_CONTENT
    assert Category.objects.count() == 0


def test_auto_translate_success(auth_client, monkeypatch):
    category = Category.objects.create(slug="museum", nombre="Museu", taxonomy="template")

    def fake_translate_text(text, source_lang, target_lang, log_translation=True):
        return f"{text}-{target_lang}"

    class FakeTranslationError(Exception):
        pass

    import sys
    import types

    fake_module = types.SimpleNamespace(translate_text=fake_translate_text, TranslationError=FakeTranslationError)
    monkeypatch.setitem(sys.modules, "llm_translations.utils", fake_module)

    url = reverse("category-auto-translate", kwargs={"pk": category.pk})
    resp = auth_client.post(url, {"source_lang": "ca", "target_langs": ["es", "en"]}, format="json")

    assert resp.status_code == status.HTTP_200_OK
    category.refresh_from_db()
    category.set_current_language("es")
    assert category.nombre == "Museu-es"
    category.set_current_language("en")
    assert category.nombre == "Museu-en"


def test_auto_translate_missing_content(auth_client):
    category = Category.objects.create(slug="empty", nombre="", taxonomy="template")

    url = reverse("category-auto-translate", kwargs={"pk": category.pk})
    resp = auth_client.post(url, {"source_lang": "ca"}, format="json")

    assert resp.status_code == status.HTTP_400_BAD_REQUEST
