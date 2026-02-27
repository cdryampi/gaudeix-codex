"""Permission tests for festes programming endpoints without Activity."""

# pyright: reportAttributeAccessIssue=false, reportMissingImports=false

from __future__ import annotations

from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category  # pyright: ignore[reportImplicitRelativeImport]
from festes.models import Festa, Program, Sponsor, Venue  # pyright: ignore[reportImplicitRelativeImport]

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
def auth_api_client(user) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def festes_category() -> Category:
    return Category.objects.create(slug="festes", taxonomy="festes", nombre="Festes")


@pytest.fixture
def festa(festes_category: Category) -> Festa:
    today = timezone.localdate()
    return Festa.objects.create(
        title="Festa Permissions",
        category=festes_category,
        start_date=today,
        end_date=today + timedelta(days=2),
        year=2026,
        is_published=True,
    )


@pytest.fixture
def program(festa: Festa) -> Program:
    return Program.objects.create(festa=festa, title="Programa Permissions")


@pytest.fixture
def venue() -> Venue:
    return Venue.objects.create(
        name="Venue Permissions",
        address="Carrer 10",
        city="Cabrera",
        is_published=True,
    )


@pytest.fixture
def sponsor(festa: Festa) -> Sponsor:
    return Sponsor.objects.create(
        festa=festa,
        name="Sponsor Permissions",
        tier="collaborator",
    )


@pytest.mark.parametrize(
    "url_name",
    ["program-list", "venue-list", "sponsor-list"],
)
def test_anonymous_can_read_programming_lists(
    anon_client: APIClient,
    url_name: str,
    program: Program,
    venue: Venue,
    sponsor: Sponsor,
) -> None:
    response = anon_client.get(reverse(url_name))
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.parametrize(
    ("url_name", "payload"),
    [
        (
            "program-list",
            lambda fixture: {
                "festa_id": fixture["festa"].id,
                "title": "Anon Program",
            },
        ),
        (
            "venue-list",
            lambda _fixture: {
                "name": "Anon Venue",
                "address": "A",
                "city": "B",
            },
        ),
        (
            "sponsor-list",
            lambda fixture: {
                "festa_id": fixture["festa"].id,
                "name": "Anon Sponsor",
                "tier": "gold",
            },
        ),
    ],
)
def test_anonymous_write_is_blocked(
    anon_client: APIClient,
    url_name: str,
    payload,
    festa: Festa,
) -> None:
    fixture = {"festa": festa}
    response = anon_client.post(reverse(url_name), payload(fixture), format="json")
    assert response.status_code in {
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    }


@pytest.mark.parametrize(
    ("url_name", "payload"),
    [
        (
            "program-list",
            lambda fixture: {
                "festa_id": fixture["festa"].id,
                "title": "User Program",
            },
        ),
        (
            "venue-list",
            lambda _fixture: {
                "name": "User Venue",
                "address": "A",
                "city": "B",
            },
        ),
        (
            "sponsor-list",
            lambda fixture: {
                "festa_id": fixture["festa"].id,
                "name": "User Sponsor",
                "tier": "silver",
            },
        ),
    ],
)
def test_non_admin_write_is_blocked(
    auth_api_client: APIClient,
    url_name: str,
    payload,
    festa: Festa,
) -> None:
    fixture = {"festa": festa}
    response = auth_api_client.post(reverse(url_name), payload(fixture), format="json")
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_admin_can_update_program_venue_and_create_sponsor(
    admin_api_client: APIClient,
    festa: Festa,
    program: Program,
    venue: Venue,
) -> None:
    program_response = admin_api_client.patch(
        reverse("program-detail", kwargs={"slug": program.slug}),
        {"title": "Admin Program", "order": 99},
        format="json",
    )
    assert program_response.status_code == status.HTTP_200_OK

    venue_response = admin_api_client.patch(
        reverse("venue-detail", kwargs={"slug": venue.slug}),
        {"city": "Mataro", "is_accessible": True},
        format="json",
    )
    assert venue_response.status_code == status.HTTP_200_OK

    sponsor_response = admin_api_client.post(
        reverse("sponsor-list"),
        {
            "festa_id": festa.id,
            "name": "Admin Sponsor",
            "tier": "gold",
            "website": "https://example.org",
        },
        format="json",
    )
    assert sponsor_response.status_code == status.HTTP_201_CREATED


def test_anonymous_cannot_patch_or_delete_programming_resources(
    anon_client: APIClient,
    program: Program,
    venue: Venue,
    sponsor: Sponsor,
) -> None:
    for url in [
        reverse("program-detail", kwargs={"slug": program.slug}),
        reverse("venue-detail", kwargs={"slug": venue.slug}),
        reverse("sponsor-detail", kwargs={"pk": sponsor.pk}),
    ]:
        patch_response = anon_client.patch(url, {}, format="json")
        delete_response = anon_client.delete(url)
        assert patch_response.status_code in {
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        }
        assert delete_response.status_code in {
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        }
