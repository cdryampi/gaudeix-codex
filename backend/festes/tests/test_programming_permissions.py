"""Permission tests for festes programming endpoints."""

# pyright: reportAttributeAccessIssue=false, reportMissingImports=false

from __future__ import annotations

from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category  # pyright: ignore[reportImplicitRelativeImport]
from festes.models import (  # pyright: ignore[reportImplicitRelativeImport]
    Activity,
    ActivityStatusChoices,
    Festa,
    Program,
    Venue,
)

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
def activity(program: Program, venue: Venue) -> Activity:
    start = timezone.now() + timedelta(days=2)
    return Activity.objects.create(
        program=program,
        venue=venue,
        title="Activity Permissions",
        category="music",
        start_at=start,
        end_at=start + timedelta(hours=1),
        status=ActivityStatusChoices.PUBLISHED,
        is_free=True,
    )


@pytest.mark.parametrize(
    "url_name",
    ["program-list", "venue-list", "activity-list"],
)
def test_anonymous_can_read_programming_lists(
    anon_client: APIClient,
    url_name: str,
    program: Program,
    venue: Venue,
    activity: Activity,
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
            lambda fixture: {
                "name": "Anon Venue",
                "address": "A",
                "city": "B",
            },
        ),
        (
            "activity-list",
            lambda fixture: {
                "program_id": fixture["program"].id,
                "title": "Anon Activity",
                "category": "music",
                "status": ActivityStatusChoices.DRAFT,
                "is_free": True,
            },
        ),
    ],
)
def test_anonymous_write_is_blocked(
    anon_client: APIClient,
    url_name: str,
    payload,
    festa: Festa,
    program: Program,
) -> None:
    fixture = {"festa": festa, "program": program}
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
            lambda fixture: {
                "name": "User Venue",
                "address": "A",
                "city": "B",
            },
        ),
        (
            "activity-list",
            lambda fixture: {
                "program_id": fixture["program"].id,
                "title": "User Activity",
                "category": "music",
                "status": ActivityStatusChoices.DRAFT,
                "is_free": True,
            },
        ),
    ],
)
def test_non_admin_write_is_blocked(
    auth_api_client: APIClient,
    url_name: str,
    payload,
    festa: Festa,
    program: Program,
) -> None:
    fixture = {"festa": festa, "program": program}
    response = auth_api_client.post(reverse(url_name), payload(fixture), format="json")
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_admin_can_update_program_venue_and_create_activity(
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

    start = timezone.now() + timedelta(days=7)
    activity_response = admin_api_client.post(
        reverse("activity-list"),
        {
            "program_id": program.id,
            "venue_id": venue.id,
            "title": "Admin Activity",
            "category": "music",
            "start_at": start.isoformat(),
            "end_at": (start + timedelta(hours=2)).isoformat(),
            "status": ActivityStatusChoices.PUBLISHED,
            "is_free": True,
        },
        format="json",
    )
    assert activity_response.status_code == status.HTTP_201_CREATED


def test_anonymous_cannot_patch_or_delete_programming_resources(
    anon_client: APIClient,
    program: Program,
    venue: Venue,
    activity: Activity,
) -> None:
    for url in [
        reverse("program-detail", kwargs={"slug": program.slug}),
        reverse("venue-detail", kwargs={"slug": venue.slug}),
        reverse("activity-detail", kwargs={"slug": activity.slug}),
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
