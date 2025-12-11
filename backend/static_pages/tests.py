from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient
from io import BytesIO
from PIL import Image

from media_files.models import DocumentFile, ImageFile
from static_pages.models import StaticPage

User = get_user_model()

pytestmark = pytest.mark.django_db


@pytest.fixture
def auth_client():
    user = User.objects.create_user(username="static", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def media_root(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    return tmp_path


@pytest.fixture
def sample_files_path(tmp_path):
    pdf_path = tmp_path / "sample.pdf"
    pdf_path.write_bytes(b"%PDF-1.4 sample")
    return tmp_path


@pytest.fixture
def sample_media(sample_files_path) -> ImageFile:
    buffer = BytesIO()
    Image.new("RGB", (10, 10), color=(255, 0, 0)).save(buffer, format="PNG")
    payload = buffer.getvalue()
    upload = SimpleUploadedFile("sample.png", payload, content_type="image/png")
    return ImageFile.objects.create(
        file=upload,
        original_name="sample.png",
        mime_type="image/png",
        size_bytes=len(payload),
    )


@pytest.fixture
def sample_doc(sample_files_path) -> DocumentFile:
    pdf_path = sample_files_path / "sample.pdf"
    payload = pdf_path.read_bytes()
    upload = SimpleUploadedFile(pdf_path.name, payload, content_type="application/pdf")
    return DocumentFile.objects.create(
        file=upload,
        original_name=pdf_path.name,
        mime_type="application/pdf",
        size_bytes=len(payload),
    )


def test_create_static_page_with_media_and_translation(auth_client, sample_media, sample_doc):
    url = reverse("staticpage-list")
    payload = {
        "slug": "info-point",
        "template": "info_point",
        "is_published": True,
        "featured_media_id": sample_media.id,
        "attachment_id": sample_doc.id,
        "titulo": "Punt d'informació",
        "cuerpo": "Contingut base",
        "translations": {
            "es": {"titulo": "Punto de información", "cuerpo": "Contenido base"},
        },
    }
    resp = auth_client.post(url, payload, format="json")
    assert resp.status_code == status.HTTP_201_CREATED
    assert resp.data["featured_media"]["id"] == sample_media.id
    assert resp.data["attachment"]["id"] == sample_doc.id

    # Uniqueness by template
    resp_dup = auth_client.post(url, payload, format="json")
    assert resp_dup.status_code == status.HTTP_400_BAD_REQUEST


def test_filter_by_template_and_publish_flag(auth_client):
    StaticPage.objects.create(slug="privacy", template="privacy", is_published=True, titulo="Privacitat")
    StaticPage.objects.create(slug="cookies", template="cookies", is_published=False, titulo="Cookies")

    client = APIClient()
    url = reverse("staticpage-list")
    resp_published = client.get(url, {"is_published": "true"})
    assert resp_published.status_code == status.HTTP_200_OK
    assert len(resp_published.data) == 1
    assert resp_published.data[0]["slug"] == "privacy"

    resp_template = client.get(url, {"template": "cookies"})
    assert resp_template.status_code == status.HTTP_200_OK
    assert len(resp_template.data) == 1
    assert resp_template.data[0]["slug"] == "cookies"


def test_auto_translate_static_page(auth_client, monkeypatch):
    page = StaticPage.objects.create(slug="legal", template="legal_notice", is_published=True, titulo="Avís legal")

    def fake_translate_text(text, source_lang, target_lang, log_translation=True):
        return f"{text}-{target_lang}"

    class FakeTranslationError(Exception):
        pass

    import sys
    import types

    fake_module = types.SimpleNamespace(translate_text=fake_translate_text, TranslationError=FakeTranslationError)
    monkeypatch.setitem(sys.modules, "llm_translations.utils", fake_module)

    url = reverse("staticpage-auto-translate", kwargs={"pk": page.pk})
    resp = auth_client.post(url, {"source_lang": "ca", "target_langs": ["es"]}, format="json")

    assert resp.status_code == status.HTTP_200_OK
    page.refresh_from_db()
    page.set_current_language("es")
    assert page.titulo == "Avís legal-es"

# Create your tests here.
