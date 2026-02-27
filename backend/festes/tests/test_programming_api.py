"""API tests for festes programming endpoints without Activity."""

# pyright: reportAttributeAccessIssue=false, reportMissingImports=false, reportOperatorIssue=false

from __future__ import annotations

from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category  # pyright: ignore[reportImplicitRelativeImport]
from events.models import Event  # pyright: ignore[reportImplicitRelativeImport]
from festes.models import (  # pyright: ignore[reportImplicitRelativeImport]
    Festa,
    FestaEvent,
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
def linked_events(festa: Festa, festes_category: Category) -> tuple[Event, Event]:
    base_start = timezone.now() + timedelta(days=2)
    event_first = Event.objects.create(
        title="Event Primer",
        summary="Resum primer",
        description="Descripcio primer",
        category=festes_category,
        start_at=base_start,
        end_at=base_start + timedelta(hours=2),
        is_published=True,
    )
    event_second = Event.objects.create(
        title="Event Segon",
        summary="Resum segon",
        description="Descripcio segon",
        category=festes_category,
        start_at=base_start + timedelta(days=1),
        end_at=base_start + timedelta(days=1, hours=2),
        is_published=True,
    )

    FestaEvent.objects.create(festa=festa, event=event_second, order=1)
    FestaEvent.objects.create(festa=festa, event=event_first, order=0)

    return event_first, event_second


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
    anon_client: APIClient,
    venue: Venue,
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


def test_festa_current_endpoint_returns_current_published(
    anon_client: APIClient,
    festes_category: Category,
) -> None:
    today = timezone.localdate()
    Festa.objects.create(
        title="No Publicada",
        category=festes_category,
        start_date=today,
        end_date=today + timedelta(days=1),
        year=today.year,
        is_current=False,
        is_published=False,
    )
    current = Festa.objects.create(
        title="Festa Actual",
        category=festes_category,
        start_date=today,
        end_date=today + timedelta(days=1),
        year=today.year,
        is_current=True,
        is_published=True,
    )

    response = anon_client.get(reverse("festa-current"))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["slug"] == current.slug


def test_festa_current_endpoint_returns_404_when_missing(
    anon_client: APIClient,
    festa: Festa,
) -> None:
    festa.is_current = False
    festa.is_published = True
    festa.save(update_fields=["is_current", "is_published"])

    response = anon_client.get(reverse("festa-current"))

    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_festa_detail_returns_linked_events_in_order(
    anon_client: APIClient,
    festa: Festa,
    linked_events: tuple[Event, Event],
) -> None:
    first, second = linked_events

    response = anon_client.get(reverse("festa-detail", kwargs={"slug": festa.slug}))

    assert response.status_code == status.HTTP_200_OK
    assert [item["id"] for item in response.data["events"]] == [first.id, second.id]


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
