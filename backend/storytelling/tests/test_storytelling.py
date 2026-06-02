from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status

from core.models import Category
from media_files.models import DocumentFile
from storytelling.models import Story

User = get_user_model()


@pytest.fixture
def sample_audio(tmp_path):
    audio_path = tmp_path / "guide.mp3"
    audio_path.write_bytes(b"dummy mp3 data")
    upload = SimpleUploadedFile("guide.mp3", b"dummy mp3 data", content_type="audio/mpeg")
    return DocumentFile.objects.create(
        file=upload,
        original_name="guide.mp3",
        mime_type="audio/mpeg",
        size_bytes=len(b"dummy mp3 data"),
    )


@pytest.fixture
def base_category(transactional_db):
    return Category.objects.create(
        slug="storytelling",
        nombre="Stories",
        taxonomy="story_type",
        is_published=True,
    )


@pytest.fixture
def sample_story(base_category, transactional_db):
    story = Story.objects.create(
        slug="test-story",
        historical_period="Iberian",
        reading_time=5,
        difficulty="easy",
        category=base_category,
        is_published=True,
    )
    story.set_current_language("ca")
    story.title = "Títol Català"
    story.summary = "Resum Català"
    story.content = "Contingut Català"
    story.save()

    story.set_current_language("en")
    story.title = "English Title"
    story.summary = "English Summary"
    story.content = "English Content"
    story.save()

    return story


@pytest.mark.django_db
def test_story_model_translation(sample_story):
    """Verify parler translation works on the model layer."""
    story = Story.objects.get(pk=sample_story.pk)
    
    story.set_current_language("ca")
    assert story.title == "Títol Català"
    assert story.summary == "Resum Català"
    assert story.content == "Contingut Català"

    story.set_current_language("en")
    assert story.title == "English Title"
    assert story.summary == "English Summary"
    assert story.content == "English Content"


@pytest.mark.django_db
def test_api_public_list_retrieve(api_client, sample_story):
    """Anonymous user can read list and retrieve single story."""
    # List
    response = api_client.get("/api/v1/stories/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1
    assert "latitude" not in response.data[0]
    assert "longitude" not in response.data[0]
    
    # Retrieve by slug
    response = api_client.get(f"/api/v1/stories/{sample_story.slug}/")
    assert response.status_code == status.HTTP_200_OK
    assert "latitude" not in response.data
    assert "longitude" not in response.data
    assert response.data["title"] == "Títol Català"  # Default locale is ca


@pytest.mark.django_db
def test_api_post_permissions_anonymous(api_client):
    """Anonymous user cannot write or modify stories."""
    response = api_client.post("/api/v1/stories/", {"title": "New"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_api_crud_admin(admin_client, base_category):
    """Admin/Staff user can perform full CRUD."""
    # Create
    payload = {
        "title": "Nova Història",
        "summary": "Resum",
        "content": "Contingut complet",
        "category_id": base_category.id,
        "historical_period": "Roman",
        "reading_time": 4,
        "difficulty": "medium",
        "is_published": True,
    }
    response = admin_client.post("/api/v1/stories/", payload, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    story_slug = response.data["slug"]
    assert story_slug == "nova-historia"

    # Update
    update_payload = {
        "title": "Títol Modificat",
        "summary": "Resum",
        "content": "Contingut",
        "category_id": base_category.id,
        "historical_period": "Roman",
        "reading_time": 6,
        "difficulty": "medium",
        "is_published": False,
    }
    response = admin_client.put(f"/api/v1/stories/{story_slug}/", update_payload, format="json")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["title"] == "Títol Modificat"
    assert response.data["reading_time"] == 6

    # Delete
    response = admin_client.delete(f"/api/v1/stories/{story_slug}/")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Story.objects.filter(slug=story_slug).exists()


@pytest.mark.django_db
def test_search_filtering(api_client, sample_story):
    """Verify search filter matches translated fields."""
    # Exact match on Catalan title
    response = api_client.get("/api/v1/stories/?search=Títol")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["slug"] == "test-story"

    # Match on English content
    response = api_client.get("/api/v1/stories/?search=Content")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["slug"] == "test-story"

    # No match
    response = api_client.get("/api/v1/stories/?search=NonExistentWord")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 0


@pytest.mark.django_db
def test_story_audio_file(sample_story, sample_audio):
    """Verify that we can link an audio file to a story translation."""
    story = Story.objects.get(pk=sample_story.pk)
    
    # Associate audio in Catalan
    story.set_current_language("ca")
    story.audio_file = sample_audio
    story.save()
    
    # Associate no audio in English (should remain None)
    story.set_current_language("en")
    story.audio_file = None
    story.save()
    
    # Reload and assert
    story.refresh_from_db()
    story.set_current_language("ca")
    assert story.audio_file == sample_audio
    
    story.set_current_language("en")
    assert story.audio_file is None


@pytest.mark.django_db
def test_api_story_audio_file_crud(admin_client, base_category, sample_audio):
    """Verify that admin can set and retrieve translatable audio file via API."""
    # Create story with audio_file in Catalan (default)
    payload = {
        "title": "Història amb Àudio",
        "summary": "Resum",
        "content": "Contingut",
        "category_id": base_category.id,
        "historical_period": "Laietania",
        "reading_time": 5,
        "difficulty": "easy",
        "is_published": True,
        "audio_file_id": sample_audio.id,
        "translations": {
            "en": {
                "title": "Story with Audio",
                "summary": "Summary",
                "content": "Content",
                "audio_file_id": None,
            }
        }
    }
    response = admin_client.post("/api/v1/stories/", payload, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["audio_file"]["id"] == sample_audio.id
    
    story_slug = response.data["slug"]
    
    # Retrieve in catalan
    response = admin_client.get(f"/api/v1/stories/{story_slug}/?lang=ca")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["audio_file"]["id"] == sample_audio.id
    
    # Update to remove audio file
    update_payload = {
        "title": "Història sense Àudio",
        "summary": "Resum",
        "content": "Contingut",
        "category_id": base_category.id,
        "historical_period": "Laietania",
        "reading_time": 5,
        "difficulty": "easy",
        "is_published": True,
        "audio_file_id": None,
    }
    response = admin_client.put(f"/api/v1/stories/{story_slug}/", update_payload, format="json")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["audio_file"] is None
