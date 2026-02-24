"""Comprehensive API tests for festes programming endpoints."""

# pyright: reportAttributeAccessIssue=false, reportMissingImports=false, reportOperatorIssue=false

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
    ProgramStatusChoices,
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
def program(festa: Festa) -> Program:
    return Program.objects.create(
        festa=festa,
        title="Programa Principal",
        status=ProgramStatusChoices.PUBLISHED,
        order=1,
    )


@pytest.fixture
def venue() -> Venue:
    return Venue.objects.create(
        name="Placa Major",
        address="Placa Major, 1",
        city="Cabrera de Mar",
        postal_code="08349",
        latitude=41.52,
        longitude=2.39,
        is_published=True,
        is_accessible=True,
    )


@pytest.fixture
def activity(program: Program, venue: Venue) -> Activity:
    start = timezone.now() + timedelta(days=5)
    return Activity.objects.create(
        program=program,
        venue=venue,
        title="Concert Jove",
        summary="Concert de nit",
        description="Actuacio principal",
        category="music",
        start_at=start,
        end_at=start + timedelta(hours=2),
        is_free=True,
        price=None,
        status=ActivityStatusChoices.PUBLISHED,
    )


def test_programs_list_is_paginated(anon_client: APIClient, program: Program) -> None:
    response = anon_client.get(reverse("program-list"))

    assert response.status_code == status.HTTP_200_OK
    assert {"count", "next", "previous", "results"}.issubset(response.data.keys())
    assert any(item["slug"] == program.slug for item in response.data["results"])


def test_program_update_and_delete_with_admin(
    admin_api_client: APIClient,
    festa: Festa,
) -> None:
    program = Program.objects.create(
        festa=festa,
        title="Programa Nou",
        status=ProgramStatusChoices.DRAFT,
        order=3,
    )

    slug = program.slug
    patch_response = admin_api_client.patch(
        reverse("program-detail", kwargs={"slug": slug}),
        {"status": ProgramStatusChoices.PUBLISHED, "order": 2},
        format="json",
    )
    assert patch_response.status_code == status.HTTP_200_OK
    assert patch_response.data["status"] == ProgramStatusChoices.PUBLISHED

    delete_response = admin_api_client.delete(
        reverse("program-detail", kwargs={"slug": slug})
    )
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT


def test_program_filters_combined(anon_client: APIClient, festa: Festa) -> None:
    Program.objects.create(
        festa=festa,
        title="Programa Publicado",
        status=ProgramStatusChoices.PUBLISHED,
        order=2,
    )
    Program.objects.create(
        festa=festa,
        title="Programa Borrador",
        status=ProgramStatusChoices.DRAFT,
        order=9,
    )

    response = anon_client.get(
        reverse("program-list"),
        {
            "festa": festa.slug,
            "status": ProgramStatusChoices.PUBLISHED,
            "is_published": "true",
            "search": "Publicado",
            "ordering": "-order",
        },
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 1
    assert response.data["results"][0]["title"] == "Programa Publicado"


def test_venues_filter_by_booleans_and_city(
    anon_client: APIClient, venue: Venue
) -> None:
    Venue.objects.create(
        name="Local No Publicat",
        address="Carrer 2",
        city="Mataro",
        is_published=False,
        is_accessible=False,
    )

    response = anon_client.get(
        reverse("venue-list"),
        {
            "is_published": "true",
            "is_accessible": "true",
            "city": "cabrera",
            "search": "placa",
        },
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 1
    assert response.data["results"][0]["slug"] == venue.slug


def test_activities_combined_filters(
    anon_client: APIClient,
    program: Program,
    venue: Venue,
    activity: Activity,
) -> None:
    other_start = timezone.now() + timedelta(days=8)
    Activity.objects.create(
        program=program,
        venue=venue,
        title="Teatre de Pagament",
        category="theatre",
        start_at=other_start,
        end_at=other_start + timedelta(hours=1),
        is_free=False,
        price=15,
        status=ActivityStatusChoices.PUBLISHED,
    )

    response = anon_client.get(
        reverse("activity-list"),
        {
            "date_from": activity.start_at.date().isoformat(),
            "date_to": activity.start_at.date().isoformat(),
            "category": "music",
            "location": "Cabrera",
            "is_free": "true",
            "search": "concert",
            "ordering": "start_at",
        },
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 1
    assert response.data["results"][0]["slug"] == activity.slug


def test_activities_invalid_date_returns_400(anon_client: APIClient) -> None:
    response = anon_client.get(reverse("activity-list"), {"date_from": "31-02-2026"})

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "date_from" in response.data


def test_activities_invalid_date_range_returns_400(anon_client: APIClient) -> None:
    response = anon_client.get(
        reverse("activity-list"),
        {
            "date_from": "2026-08-10",
            "date_to": "2026-08-01",
        },
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "date_range" in response.data


def test_activity_create_rejects_unsafe_ticket_url(
    admin_api_client: APIClient,
    program: Program,
) -> None:
    response = admin_api_client.post(
        reverse("activity-list"),
        {
            "program_id": program.id,
            "title": "Entrada insegura",
            "category": "music",
            "status": ActivityStatusChoices.DRAFT,
            "is_free": True,
            "ticket_url": "javascript:alert(1)",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "ticket_url" in response.data


def test_activity_create_published_triggers_notification_gateway(
    admin_api_client: APIClient,
    program: Program,
    venue: Venue,
    monkeypatch,
) -> None:
    calls: list[str] = []

    def fake_notify(instance: Activity) -> None:
        calls.append(str(instance.slug))

    monkeypatch.setattr(
        "festes.views.notification_gateway.notify_activity_published", fake_notify
    )

    start = timezone.now() + timedelta(days=9)
    response = admin_api_client.post(
        reverse("activity-list"),
        {
            "program_id": program.id,
            "venue_id": venue.id,
            "title": "Acte Publicat",
            "category": "music",
            "start_at": start.isoformat(),
            "end_at": (start + timedelta(hours=1)).isoformat(),
            "is_free": True,
            "status": ActivityStatusChoices.PUBLISHED,
            "ticket_url": "https://tickets.example.com/event/1",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert len(calls) == 1


def test_activity_patch_from_draft_to_published_triggers_notification_once(
    admin_api_client: APIClient,
    program: Program,
    venue: Venue,
    monkeypatch,
) -> None:
    start = timezone.now() + timedelta(days=10)
    draft = Activity.objects.create(
        program=program,
        title="Draft",
        category="music",
        status=ActivityStatusChoices.DRAFT,
        is_free=True,
    )

    calls: list[str] = []

    def fake_notify(instance: Activity) -> None:
        calls.append(str(instance.slug))

    monkeypatch.setattr(
        "festes.views.notification_gateway.notify_activity_published", fake_notify
    )

    response = admin_api_client.patch(
        reverse("activity-detail", kwargs={"slug": draft.slug}),
        {
            "status": ActivityStatusChoices.PUBLISHED,
            "venue_id": venue.id,
            "start_at": start.isoformat(),
            "end_at": (start + timedelta(hours=1)).isoformat(),
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert len(calls) == 1


def test_program_i18n_fallback_for_missing_requested_language(
    anon_client: APIClient,
    festa: Festa,
) -> None:
    program = Program.objects.create(festa=festa, title="Programa Catala")

    response = anon_client.get(
        reverse("program-detail", kwargs={"slug": program.slug}),
        HTTP_ACCEPT_LANGUAGE="en",
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["title"] == "Programa Catala"
