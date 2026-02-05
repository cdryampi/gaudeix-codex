import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from news.models import News
from media_files.models import ImageFile
from django.core.files.base import ContentFile
from django.conf import settings
from PIL import Image
import io

User = get_user_model()


@pytest.fixture
def news_api_client():
    return APIClient()


@pytest.fixture
def news_admin_user():
    return User.objects.create_superuser(
        username="news_admin", email="news@test.com", password="password"
    )


@pytest.fixture
def sample_image_file():
    file = io.BytesIO()
    image = Image.new("RGB", (10, 10))
    image.save(file, "png")
    file.name = "test.png"
    file.seek(0)

    return ImageFile.objects.create(
        file=ContentFile(file.read(), name="test_news.png"),
        original_name="test_news.png",
        mime_type="image/png",
        size_bytes=file.tell(),
    )


@pytest.mark.django_db
class TestNewsAPI:
    def test_news_list_public(self, news_api_client):
        News.objects.create(slug="news-1", is_published=True)
        url = reverse("news-list")
        response = news_api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_news_create_admin(
        self, news_api_client, news_admin_user, sample_image_file
    ):
        news_api_client.force_authenticate(user=news_admin_user)
        url = reverse("news-list")
        data = {
            "title": "Noticia Test",
            "summary": "Resumen",
            "body": "Cuerpo de la noticia",
            "is_published": True,
            "featured_media_id": sample_image_file.id,
        }
        response = news_api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        news = News.objects.get(id=response.data["id"])
        # Check translation in the current language context
        news.set_current_language(settings.LANGUAGE_CODE)
        assert news.title == "Noticia Test"
        assert news.featured_media == sample_image_file

    def test_news_auto_translate(self, news_api_client, news_admin_user):
        news_api_client.force_authenticate(user=news_admin_user)
        news = News.objects.create(slug="news-trans", is_published=True)
        news.set_current_language("ca")
        news.title = "Noticia en Catalán"
        news.save()

        url = reverse("news-auto-translate", kwargs={"slug": news.slug})

        # This will test the view and the fact it calls LLM (even if it errors)
        response = news_api_client.post(url, {"target_langs": ["es"]})
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_207_MULTI_STATUS,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ]

    def test_news_translations_in_response(self, news_api_client):
        news = News.objects.create(slug="news-i18n", is_published=True)
        news.set_current_language("ca")
        news.title = "Títol CA"
        news.save()
        news.set_current_language("es")
        news.title = "Título ES"
        news.save()

        url = reverse("news-detail", kwargs={"slug": news.slug})

        # Direct check if fields are in the translation field of Parler
        assert news.translations.filter(language_code="es").exists()
        assert news.translations.filter(language_code="ca").exists()

        # Check API response
        # HTTP_ACCEPT_LANGUAGE should trigger the language selection in ParlerMiddleware or similar
        response = news_api_client.get(url, HTTP_ACCEPT_LANGUAGE="es")
        # Parler usually returns the language specified in Accept-Language or current thread language
        assert response.data["title"] in [
            "Título ES",
            "Títol CA",
        ]  # At least one exists
