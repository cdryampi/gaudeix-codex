"""
Tests for the Users app.
"""

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse

from core.models import Category
from events.models import Event, EventCategorySingleton, UserFavoriteEvent


User = get_user_model()

pytestmark = pytest.mark.django_db


class TestUserRegistration:
    """Tests for user registration (public endpoint)."""

    def test_register_user_success(self):
        """Test successful user registration without authentication."""
        client = APIClient()
        url = reverse("user-list")
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "name": "New User",
            "password": "TestPass123!",
            "password_confirm": "TestPass123!",
        }

        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert "password" not in response.data
        assert response.data["username"] == "newuser"
        assert User.objects.filter(username="newuser").exists()

    def test_register_user_password_mismatch(self):
        """Test registration fails when passwords don't match."""
        client = APIClient()
        url = reverse("user-list")
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "name": "New User",
            "password": "TestPass123!",
            "password_confirm": "DifferentPass123!",
        }

        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password" in response.data

    def test_register_user_weak_password(self):
        """Test registration fails with weak password."""
        client = APIClient()
        url = reverse("user-list")
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "name": "New User",
            "password": "123",
            "password_confirm": "123",
        }

        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_user_duplicate_username(self):
        """Test registration fails with duplicate username."""
        User.objects.create_user(username="existing", password="pass123")

        client = APIClient()
        url = reverse("user-list")
        data = {
            "username": "existing",
            "email": "new@example.com",
            "name": "New User",
            "password": "TestPass123!",
            "password_confirm": "TestPass123!",
        }

        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestUserRetrieve:
    """Tests for retrieving user data."""

    def test_unauthenticated_cannot_retrieve_user(self):
        """Test unauthenticated users cannot retrieve user data."""
        user = User.objects.create_user(username="testuser", password="pass123")

        client = APIClient()
        url = reverse("user-detail", kwargs={"pk": user.pk})
        response = client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_user_can_retrieve_own_data(self):
        """Test authenticated user can retrieve their own data."""
        user = User.objects.create_user(
            username="testuser", email="test@example.com", password="pass123"
        )

        client = APIClient()
        client.force_authenticate(user=user)
        url = reverse("user-detail", kwargs={"pk": user.pk})
        response = client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["username"] == "testuser"
        assert "password" not in response.data

    def test_user_cannot_retrieve_other_user(self):
        """Test user cannot retrieve another user's data."""
        user1 = User.objects.create_user(username="user1", password="pass123")
        user2 = User.objects.create_user(username="user2", password="pass123")

        client = APIClient()
        client.force_authenticate(user=user1)
        url = reverse("user-detail", kwargs={"pk": user2.pk})
        response = client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_admin_can_retrieve_any_user(self):
        """Test admin can retrieve any user's data."""
        admin = User.objects.create_user(
            username="admin", password="pass123", is_staff=True
        )
        user = User.objects.create_user(username="testuser", password="pass123")

        client = APIClient()
        client.force_authenticate(user=admin)
        url = reverse("user-detail", kwargs={"pk": user.pk})
        response = client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["username"] == "testuser"


class TestUserMe:
    """Tests for self-service user endpoints."""

    def test_unauthenticated_cannot_access_me(self):
        """Test unauthenticated users cannot access /me."""
        client = APIClient()
        url = reverse("user-me")
        response = client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_user_can_retrieve_own_profile(self):
        """Test authenticated user can retrieve their profile via /me."""
        user = User.objects.create_user(
            username="testuser", email="test@example.com", password="pass123"
        )

        client = APIClient()
        client.force_authenticate(user=user)
        url = reverse("user-me")
        response = client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["username"] == "testuser"

    def test_user_can_update_own_profile(self):
        """Test authenticated user can update their profile via /me."""
        user = User.objects.create_user(
            username="testuser", email="old@example.com", password="pass123"
        )

        client = APIClient()
        client.force_authenticate(user=user)
        url = reverse("user-me")
        data = {"name": "Updated Name", "email": "new@example.com"}
        response = client.patch(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.name == "Updated Name"
        assert user.email == "new@example.com"

    def test_user_can_delete_own_account(self):
        """Test authenticated user can delete their account via /me."""
        user = User.objects.create_user(username="testuser", password="pass123")

        client = APIClient()
        client.force_authenticate(user=user)
        url = reverse("user-me")
        response = client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not User.objects.filter(pk=user.pk).exists()


class TestUserFavorites:
    """Tests for user favorites endpoints."""

    def test_user_favorites_list_ordering(self):
        user = User.objects.create_user(username="favuser", password="pass123")
        category = Category.objects.create(
            slug="events", taxonomy="events", nombre="Events"
        )
        EventCategorySingleton.objects.create(category=category)
        event_first = Event.objects.create(
            title="First Favorite",
            start_at=timezone.now() + timezone.timedelta(days=1),
        )
        event_second = Event.objects.create(
            title="Second Favorite",
            start_at=timezone.now() + timezone.timedelta(days=2),
        )

        UserFavoriteEvent.objects.create(user=user, event=event_first)
        UserFavoriteEvent.objects.create(user=user, event=event_second)

        client = APIClient()
        client.force_authenticate(user=user)
        url = reverse("user-my-favorites")
        response = client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]["id"] == event_second.id
        assert response.data[1]["id"] == event_first.id

    def test_user_favorites_upcoming(self):
        user = User.objects.create_user(username="favupcoming", password="pass123")
        category = Category.objects.create(
            slug="events", taxonomy="events", nombre="Events"
        )
        EventCategorySingleton.objects.create(category=category)
        future_event = Event.objects.create(
            title="Future Favorite",
            start_at=timezone.now() + timezone.timedelta(days=3),
        )
        past_event = Event.objects.create(
            title="Past Favorite",
            start_at=timezone.now() - timezone.timedelta(days=1),
        )

        UserFavoriteEvent.objects.create(user=user, event=future_event)
        UserFavoriteEvent.objects.create(user=user, event=past_event)

        client = APIClient()
        client.force_authenticate(user=user)
        url = reverse("user-my-favorites-upcoming")
        response = client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["id"] == future_event.id


class TestUserUpdate:
    """Tests for updating user data."""

    def test_unauthenticated_cannot_update_user(self):
        """Test unauthenticated users cannot update user data."""
        user = User.objects.create_user(username="testuser", password="pass123")

        client = APIClient()
        url = reverse("user-detail", kwargs={"pk": user.pk})
        data = {"name": "Updated Name"}
        response = client.patch(url, data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_user_can_update_own_data(self):
        """Test user can update their own data."""
        user = User.objects.create_user(
            username="testuser", email="old@example.com", password="pass123"
        )

        client = APIClient()
        client.force_authenticate(user=user)
        url = reverse("user-detail", kwargs={"pk": user.pk})
        data = {"name": "Updated Name", "email": "new@example.com"}
        response = client.patch(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.name == "Updated Name"
        assert user.email == "new@example.com"

    def test_user_cannot_update_other_user(self):
        """Test user cannot update another user's data."""
        user1 = User.objects.create_user(username="user1", password="pass123")
        user2 = User.objects.create_user(username="user2", password="pass123")

        client = APIClient()
        client.force_authenticate(user=user1)
        url = reverse("user-detail", kwargs={"pk": user2.pk})
        data = {"name": "Hacked Name"}
        response = client.patch(url, data, format="json")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_admin_can_update_any_user(self):
        """Test admin can update any user's data."""
        admin = User.objects.create_user(
            username="admin", password="pass123", is_staff=True
        )
        user = User.objects.create_user(username="testuser", password="pass123")

        client = APIClient()
        client.force_authenticate(user=admin)
        url = reverse("user-detail", kwargs={"pk": user.pk})
        data = {"name": "Admin Updated"}
        response = client.patch(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.name == "Admin Updated"


class TestUserDelete:
    """Tests for deleting user accounts."""

    def test_unauthenticated_cannot_delete_user(self):
        """Test unauthenticated users cannot delete accounts."""
        user = User.objects.create_user(username="testuser", password="pass123")

        client = APIClient()
        url = reverse("user-detail", kwargs={"pk": user.pk})
        response = client.delete(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert User.objects.filter(pk=user.pk).exists()

    def test_user_can_delete_own_account(self):
        """Test user can delete their own account."""
        user = User.objects.create_user(username="testuser", password="pass123")

        client = APIClient()
        client.force_authenticate(user=user)
        url = reverse("user-detail", kwargs={"pk": user.pk})
        response = client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not User.objects.filter(pk=user.pk).exists()

    def test_user_cannot_delete_other_user(self):
        """Test user cannot delete another user's account."""
        user1 = User.objects.create_user(username="user1", password="pass123")
        user2 = User.objects.create_user(username="user2", password="pass123")

        client = APIClient()
        client.force_authenticate(user=user1)
        url = reverse("user-detail", kwargs={"pk": user2.pk})
        response = client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert User.objects.filter(pk=user2.pk).exists()

    def test_admin_can_delete_any_user(self):
        """Test admin can delete any user's account."""
        admin = User.objects.create_user(
            username="admin", password="pass123", is_staff=True
        )
        user = User.objects.create_user(username="testuser", password="pass123")

        client = APIClient()
        client.force_authenticate(user=admin)
        url = reverse("user-detail", kwargs={"pk": user.pk})
        response = client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not User.objects.filter(pk=user.pk).exists()


class TestPasswordReset:
    """Tests for password reset functionality."""

    def test_password_reset_request_public_access(self):
        """Test password reset request is accessible without authentication."""
        user = User.objects.create_user(
            username="testuser", email="test@example.com", password="pass123"
        )

        client = APIClient()
        url = reverse("password-reset-request")
        data = {"email": "test@example.com"}
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "detail" in response.data

    def test_password_reset_does_not_leak_user_existence(self):
        """Test password reset doesn't reveal if email exists."""
        client = APIClient()
        url = reverse("password-reset-request")
        data = {"email": "nonexistent@example.com"}
        response = client.post(url, data, format="json")

        # Should return success even if user doesn't exist
        assert response.status_code == status.HTTP_200_OK
        assert "detail" in response.data

    def test_password_reset_confirm_with_valid_token(self):
        """Test password reset confirmation with valid token."""
        user = User.objects.create_user(
            username="testuser", email="test@example.com", password="OldPass123!"
        )

        # Generate reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        client = APIClient()
        url = reverse("password-reset-confirm")
        data = {
            "uid": uid,
            "token": token,
            "new_password": "NewPass123!",
            "new_password_confirm": "NewPass123!",
        }
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.check_password("NewPass123!")

    def test_password_reset_confirm_with_invalid_token(self):
        """Test password reset confirmation fails with invalid token."""
        user = User.objects.create_user(
            username="testuser", email="test@example.com", password="OldPass123!"
        )

        uid = urlsafe_base64_encode(force_bytes(user.pk))

        client = APIClient()
        url = reverse("password-reset-confirm")
        data = {
            "uid": uid,
            "token": "invalid-token",
            "new_password": "NewPass123!",
            "new_password_confirm": "NewPass123!",
        }
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_password_reset_confirm_password_mismatch(self):
        """Test password reset fails when passwords don't match."""
        user = User.objects.create_user(
            username="testuser", email="test@example.com", password="OldPass123!"
        )

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        client = APIClient()
        url = reverse("password-reset-confirm")
        data = {
            "uid": uid,
            "token": token,
            "new_password": "NewPass123!",
            "new_password_confirm": "DifferentPass123!",
        }
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestUserList:
    """Tests for listing users."""

    def test_unauthenticated_cannot_list_users(self):
        """Test unauthenticated users cannot list users."""
        client = APIClient()
        url = reverse("user-list")
        response = client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_regular_user_sees_only_self(self):
        """Test regular user can only see themselves in list."""
        user1 = User.objects.create_user(username="user1", password="pass123")
        user2 = User.objects.create_user(username="user2", password="pass123")

        client = APIClient()
        client.force_authenticate(user=user1)
        url = reverse("user-list")
        response = client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["username"] == "user1"

    def test_admin_sees_all_users(self):
        """Test admin can see all users in list."""
        admin = User.objects.create_user(
            username="admin", password="pass123", is_staff=True
        )
        user1 = User.objects.create_user(username="user1", password="pass123")
        user2 = User.objects.create_user(username="user2", password="pass123")

        client = APIClient()
        client.force_authenticate(user=admin)
        url = reverse("user-list")
        response = client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 3  # admin + user1 + user2


class TestLogin:
    """Tests for login functionality."""

    def test_login_success(self):
        """Test successful login with valid credentials."""
        user = User.objects.create_user(
            username="testuser", email="test@example.com", password="TestPass123!"
        )

        client = APIClient()
        url = reverse("login")
        data = {"username": "testuser", "password": "TestPass123!"}
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert "user" in response.data
        assert response.data["user"]["username"] == "testuser"
        assert response.data["user"]["email"] == "test@example.com"
        assert "password" not in response.data["user"]

    def test_login_invalid_credentials(self):
        """Test login fails with invalid credentials."""
        user = User.objects.create_user(username="testuser", password="TestPass123!")

        client = APIClient()
        url = reverse("login")
        data = {"username": "testuser", "password": "WrongPassword"}
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "access" not in response.data

    def test_login_nonexistent_user(self):
        """Test login fails with non-existent username."""
        client = APIClient()
        url = reverse("login")
        data = {"username": "nonexistent", "password": "TestPass123!"}
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "access" not in response.data

    def test_login_inactive_user(self):
        """Test login fails for inactive user."""
        user = User.objects.create_user(
            username="testuser", password="TestPass123!", is_active=False
        )

        client = APIClient()
        url = reverse("login")
        data = {"username": "testuser", "password": "TestPass123!"}
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "access" not in response.data

    def test_login_missing_username(self):
        """Test login fails when username is missing."""
        client = APIClient()
        url = reverse("login")
        data = {"password": "TestPass123!"}
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_missing_password(self):
        """Test login fails when password is missing."""
        client = APIClient()
        url = reverse("login")
        data = {"username": "testuser"}
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_returns_valid_jwt_tokens(self):
        """Test that login returns valid JWT tokens."""
        user = User.objects.create_user(username="testuser", password="TestPass123!")

        client = APIClient()
        url = reverse("login")
        data = {"username": "testuser", "password": "TestPass123!"}
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK

        # Verify access token can be used for authentication
        access_token = response.data["access"]
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        # Try to access a protected endpoint
        user_url = reverse("user-detail", kwargs={"pk": user.pk})
        user_response = client.get(user_url)

        assert user_response.status_code == status.HTTP_200_OK
        assert user_response.data["username"] == "testuser"

    def test_login_with_email_success(self):
        """Test successful login using email instead of username."""
        user = User.objects.create_user(
            username="testuser", email="test@example.com", password="TestPass123!"
        )

        client = APIClient()
        url = reverse("login")
        data = {
            "username": "test@example.com",  # Using email in username field
            "password": "TestPass123!",
        }
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert "user" in response.data
        assert response.data["user"]["username"] == "testuser"
        assert response.data["user"]["email"] == "test@example.com"

    def test_login_with_email_wrong_password(self):
        """Test login with email fails with wrong password."""
        user = User.objects.create_user(
            username="testuser", email="test@example.com", password="TestPass123!"
        )

        client = APIClient()
        url = reverse("login")
        data = {"username": "test@example.com", "password": "WrongPassword"}
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "access" not in response.data

    def test_login_with_nonexistent_email(self):
        """Test login fails with non-existent email."""
        client = APIClient()
        url = reverse("login")
        data = {"username": "nonexistent@example.com", "password": "TestPass123!"}
        response = client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "access" not in response.data
