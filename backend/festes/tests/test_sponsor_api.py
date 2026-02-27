"""Comprehensive API tests for festes sponsor endpoints."""

# pyright: reportAttributeAccessIssue=false, reportMissingImports=false, reportOperatorIssue=false

from __future__ import annotations

from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category  # pyright: ignore[reportImplicitRelativeImport]
from media_files.models import ImageFile  # pyright: ignore[reportImplicitRelativeImport]
from festes.models import Festa, Sponsor  # pyright: ignore[reportImplicitRelativeImport]

pytestmark = pytest.mark.django_db


@pytest.fixture
def anon_client() -> APIClient:
    return APIClient()


@pytest.fixture
def admin_api_client(admin_user) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


@pytest.fixture
def festes_category() -> Category:
    return Category.objects.create(slug="festes", taxonomy="festes", nombre="Festes")


@pytest.fixture
def festa(festes_category: Category) -> Festa:
    today = timezone.localdate()
    return Festa.objects.create(
        title="Festa Major 2026",
        category=festes_category,
        start_date=today,
        end_date=today + timedelta(days=4),
        year=2026,
        is_published=True,
    )


@pytest.fixture
def test_image() -> ImageFile:
    return ImageFile.objects.create(
        file="test_image.jpg",
        original_name="test_image.jpg",
        mime_type="image/jpeg",
        size_bytes=1024,
    )


@pytest.fixture
def sponsor(festa: Festa) -> Sponsor:
    return Sponsor.objects.create(
        festa=festa,
        name="Test Sponsor",
        tier="gold",
        order=1,
    )


def test_sponsors_list(anon_client: APIClient, sponsor: Sponsor) -> None:
    response = anon_client.get(reverse("sponsor-list"))

    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.data, list)
    assert any(item["id"] == sponsor.id for item in response.data)


def test_sponsor_create_with_festa_id(
    admin_api_client: APIClient,
    festa: Festa,
    test_image: ImageFile,
) -> None:
    response = admin_api_client.post(
        reverse("sponsor-list"),
        {
            "festa_id": festa.id,
            "name": "New Gold Sponsor",
            "tier": "gold",
            "order": 1,
            "logo_id": test_image.id,
            "website": "https://example.com",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["festa"] == festa.id
    assert response.data["name"] == "New Gold Sponsor"
    assert "logo" in response.data
    # Check that it's created in DB
    assert Sponsor.objects.filter(id=response.data["id"], festa=festa).exists()


def test_sponsor_update(
    admin_api_client: APIClient,
    sponsor: Sponsor,
    test_image: ImageFile,
) -> None:
    response = admin_api_client.patch(
        reverse("sponsor-detail", kwargs={"pk": sponsor.id}),
        {
            "name": "Updated Sponsor Name",
            "logo_id": test_image.id,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["name"] == "Updated Sponsor Name"
    assert response.data["logo"] is not None

    sponsor.refresh_from_db()
    assert sponsor.name == "Updated Sponsor Name"
    assert sponsor.logo_id == test_image.id


def test_sponsor_filter_by_festa_id(
    anon_client: APIClient,
    festa: Festa,
    sponsor: Sponsor,
) -> None:
    other_festa = Festa.objects.create(
        title="Other Festa",
        category=festa.category,
        start_date=festa.start_date,
        end_date=festa.end_date,
        year=2026,
    )
    other_sponsor = Sponsor.objects.create(
        festa=other_festa,
        name="Other Sponsor",
        tier="silver",
        order=2,
    )

    response = anon_client.get(
        reverse("sponsor-list"),
        {"festa": festa.id},
    )

    assert response.status_code == status.HTTP_200_OK
    results = response.data
    assert len(results) == 1
    assert results[0]["id"] == sponsor.id


def test_sponsor_filter_by_festa_slug(
    anon_client: APIClient,
    festa: Festa,
    sponsor: Sponsor,
) -> None:
    other_festa = Festa.objects.create(
        title="Other Festa",
        category=festa.category,
        start_date=festa.start_date,
        end_date=festa.end_date,
        year=2026,
    )
    other_sponsor = Sponsor.objects.create(
        festa=other_festa,
        name="Other Sponsor",
        tier="silver",
        order=2,
    )

    response = anon_client.get(
        reverse("sponsor-list"),
        {"festa": festa.slug},
    )

    assert response.status_code == status.HTTP_200_OK
    results = response.data
    assert len(results) == 1
    assert results[0]["id"] == sponsor.id
