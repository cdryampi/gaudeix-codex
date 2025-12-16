from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def user() -> User:
    return User.objects.create_user(username="user", password="pass123", name="User")


@pytest.fixture
def admin_user() -> User:
    return User.objects.create_user(
        username="admin",
        password="pass123",
        name="Admin",
        is_staff=True,
        is_superuser=True,
    )


@pytest.fixture
def auth_client(api_client: APIClient, user: User) -> APIClient:
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def admin_client(api_client: APIClient, admin_user: User) -> APIClient:
    api_client.force_authenticate(user=admin_user)
    return api_client

