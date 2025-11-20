import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import SocialLink

@pytest.mark.django_db
class TestSocialLink:
    """
    Test suite for SocialLink model and API.
    """

    def test_create_social_link(self):
        """
        Test creating a SocialLink instance.
        """
        link = SocialLink.objects.create(
            name="Facebook",
            url="https://facebook.com",
            icon_class="fa-brands fa-facebook",
            color="#3b5998",
            order=1
        )
        assert link.name == "Facebook"
        assert link.url == "https://facebook.com"
        assert link.color == "#3b5998"
        assert link.available_in_ca is True

    def test_hex_validation(self):
        """
        Test hex color validation.
        """
        from django.core.exceptions import ValidationError
        from .utils import validate_hex_color

        assert validate_hex_color("#FFFFFF") is True
        assert validate_hex_color("FFFFFF") is True
        assert validate_hex_color("#FFF") is True
        assert validate_hex_color("ZZZZZZ") is False
        
        # Test model validation
        link = SocialLink(
            name="Invalid",
            url="http://test.com",
            icon_class="fa-test",
            color="INVALID"
        )
        with pytest.raises(ValidationError):
            link.full_clean()

    def test_translation(self):
        """
        Test that translations work correctly using django-parler.
        """
        link = SocialLink.objects.create(
            name="Facebook",
            url="https://facebook.com",
            icon_class="fa-brands fa-facebook"
        )
        
        # Set Spanish translation
        link.set_current_language('es')
        link.name = "Facebook ES"
        link.save()
        
        # Verify English (default/fallback)
        link.set_current_language('en')
        assert link.name == "Facebook"
        
        # Verify Spanish
        link.set_current_language('es')
        assert link.name == "Facebook ES"

    def test_api_list(self):
        """
        Test retrieving the list of social links via API.
        """
        client = APIClient()
        SocialLink.objects.create(
            name="Insta", 
            url="http://insta.com", 
            icon_class="fa-instagram",
            color="#E1306C"
        )
        
        url = reverse('sociallink-list')
        response = client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0
        assert response.data[0]['color'] == "#E1306C"

    def test_retrieve_social_link(self):
        """
        Test retrieving a single social link details.
        """
        client = APIClient()
        link = SocialLink.objects.create(
            name="Twitter",
            url="https://twitter.com",
            icon_class="fa-brands fa-twitter",
            color="#1DA1F2"
        )
        
        url = reverse('sociallink-detail', kwargs={'pk': link.pk})
        response = client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == "Twitter"
        assert response.data['color'] == "#1DA1F2"

    def test_update_social_link(self):
        """
        Test updating a social link.
        """
        client = APIClient()
        link = SocialLink.objects.create(
            name="Old Name",
            url="https://old.com",
            icon_class="fa-old",
            color="#000000"
        )
        
        url = reverse('sociallink-detail', kwargs={'pk': link.pk})
        data = {
            "translations": {"en": {"name": "New Name"}},
            "url": "https://new.com",
            "icon_class": "fa-new",
            "color": "#FFFFFF",
            "available_in_en": False
        }
        
        response = client.put(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        link.refresh_from_db()
        link.set_current_language('en')
        assert link.name == "New Name"
        assert link.url == "https://new.com"
        assert link.color == "#FFFFFF"
        assert link.available_in_en is False

    def test_delete_social_link(self):
        """
        Test deleting a social link.
        """
        client = APIClient()
        link = SocialLink.objects.create(
            name="To Delete",
            url="https://delete.com",
            icon_class="fa-delete"
        )
        
        url = reverse('sociallink-detail', kwargs={'pk': link.pk})
        response = client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert SocialLink.objects.count() == 0


@pytest.mark.django_db
class TestSocialLinkHistory:
    """Tests for historical tracking of SocialLink model."""
    
    def test_history_created_on_create(self):
        """Test that a historical record is created when a SocialLink is created."""
        link = SocialLink.objects.create(
            name="Facebook",
            url="https://facebook.com",
            icon_class="fa-brands fa-facebook",
            color="#3b5998"
        )
        
        # Check that history exists
        assert link.history.count() == 1
        history_record = link.history.first()
        assert history_record.history_type == "+"  # Created
        assert history_record.url == "https://facebook.com"
    
    def test_history_created_on_update(self):
        """Test that a historical record is created when a SocialLink is updated."""
        link = SocialLink.objects.create(
            name="Twitter",
            url="https://twitter.com",
            icon_class="fa-brands fa-twitter",
            color="#1DA1F2"
        )
        
        # Update the link
        link.url = "https://x.com"
        link.save()
        
        # Check that we have 2 history records (create + update)
        assert link.history.count() == 2
        latest_history = link.history.first()
        assert latest_history.history_type == "~"  # Modified
        assert latest_history.url == "https://x.com"
    
    def test_history_created_on_delete(self):
        """Test that a historical record is created when a SocialLink is deleted."""
        link = SocialLink.objects.create(
            name="Instagram",
            url="https://instagram.com",
            icon_class="fa-brands fa-instagram",
            color="#E1306C"
        )
        
        link_id = link.id
        link.delete()
        
        # Check history still exists after deletion
        history = SocialLink.history.filter(id=link_id)
        assert history.count() == 2  # Create + delete
        latest_history = history.first()
        assert latest_history.history_type == "-"  # Deleted
