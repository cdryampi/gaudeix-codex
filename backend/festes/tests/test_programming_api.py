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
from events.models import Event  # pyright: ignore[reportImplicitRelativeImport]

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
def test_event(festes_category: Category) -> Event:
    return Event.objects.create(
        title="Event Original",
        summary="Aquest es el resum original",
        description="Descripcio original",
        category=festes_category,
        start_at=timezone.now(),
        end_at=timezone.now() + timedelta(hours=2),
        is_published=True,
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


def test_activity_create_mirrors_event_data(
    admin_api_client: APIClient,
    program: Program,
    venue: Venue,
    test_event: Event,
) -> None:
    start = timezone.now() + timedelta(days=9)
    response = admin_api_client.post(
        reverse("activity-list"),
        {
            "program_id": program.id,
            "venue_id": venue.id,
            "event": test_event.id,
            "title": "",  # Blank title should mirror event
            "summary": "",  # Blank summary should mirror event
            "category": "music",
            "start_at": start.isoformat(),
            "end_at": (start + timedelta(hours=1)).isoformat(),
            "is_free": True,
            "status": ActivityStatusChoices.PUBLISHED,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED, response.data
    assert response.data["title"] == test_event.title
    assert response.data["summary"] == test_event.summary


def test_activity_patch_mirrors_from_existing_event_link(
    admin_api_client: APIClient,
    program: Program,
    venue: Venue,
    test_event: Event,
) -> None:
    start = timezone.now() + timedelta(days=11)
    linked = Activity.objects.create(
        program=program,
        venue=venue,
        event=test_event,
        title="Manual title",
        summary="Manual summary",
        category="music",
        start_at=start,
        end_at=start + timedelta(hours=1),
        is_free=True,
        status=ActivityStatusChoices.DRAFT,
    )

    response = admin_api_client.patch(
        reverse("activity-detail", kwargs={"slug": linked.slug}),
        {
            "title": "",
            "summary": "",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK, response.data
    assert response.data["event"]["id"] == test_event.id
    assert response.data["title"] == test_event.title
    assert response.data["summary"] == test_event.summary


def test_activity_patch_without_event_keeps_link_for_later_mirror(
    admin_api_client: APIClient,
    program: Program,
    venue: Venue,
    test_event: Event,
) -> None:
    start = timezone.now() + timedelta(days=11)
    linked = Activity.objects.create(
        program=program,
        venue=venue,
        event=test_event,
        title="Titol manual",
        summary="Resum manual",
        category="music",
        start_at=start,
        end_at=start + timedelta(hours=1),
        is_free=True,
        status=ActivityStatusChoices.DRAFT,
    )

    preserve_response = admin_api_client.patch(
        reverse("activity-detail", kwargs={"slug": linked.slug}),
        {"category": "culture"},
        format="json",
    )
    assert preserve_response.status_code == status.HTTP_200_OK, preserve_response.data
    assert preserve_response.data["event"]["id"] == test_event.id

    mirror_response = admin_api_client.patch(
        reverse("activity-detail", kwargs={"slug": linked.slug}),
        {"title": "", "summary": ""},
        format="json",
    )
    assert mirror_response.status_code == status.HTTP_200_OK, mirror_response.data
    assert mirror_response.data["event"]["id"] == test_event.id
    assert mirror_response.data["title"] == test_event.title
    assert mirror_response.data["summary"] == test_event.summary


def test_activity_patch_allows_explicit_event_unlink(
    admin_api_client: APIClient,
    program: Program,
    venue: Venue,
    test_event: Event,
) -> None:
    start = timezone.now() + timedelta(days=12)
    linked = Activity.objects.create(
        program=program,
        venue=venue,
        event=test_event,
        title="Title before unlink",
        summary="Summary before unlink",
        category="music",
        start_at=start,
        end_at=start + timedelta(hours=1),
        is_free=True,
        status=ActivityStatusChoices.DRAFT,
    )

    response = admin_api_client.patch(
        reverse("activity-detail", kwargs={"slug": linked.slug}),
        {
            "event": None,
            "title": "Title after unlink",
            "summary": "Summary after unlink",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK, response.data
    assert response.data["event"] is None

    linked.refresh_from_db()
    assert linked.event_id is None


def test_activities_filter_by_has_event(
    anon_client: APIClient,
    program: Program,
    venue: Venue,
    test_event: Event,
) -> None:
    start = timezone.now() + timedelta(days=13)
    with_event = Activity.objects.create(
        program=program,
        venue=venue,
        event=test_event,
        title="Amb event",
        category="music",
        start_at=start,
        end_at=start + timedelta(hours=1),
        is_free=True,
        status=ActivityStatusChoices.PUBLISHED,
    )
    without_event = Activity.objects.create(
        program=program,
        venue=venue,
        title="Sense event",
        category="music",
        start_at=start + timedelta(days=1),
        end_at=start + timedelta(days=1, hours=1),
        is_free=True,
        status=ActivityStatusChoices.PUBLISHED,
    )

    response_with = anon_client.get(reverse("activity-list"), {"has_event": "true"})
    assert response_with.status_code == status.HTTP_200_OK
    slugs_with = {item["slug"] for item in response_with.data["results"]}
    assert with_event.slug in slugs_with
    assert without_event.slug not in slugs_with

    response_without = anon_client.get(reverse("activity-list"), {"has_event": "false"})
    assert response_without.status_code == status.HTTP_200_OK
    slugs_without = {item["slug"] for item in response_without.data["results"]}
    assert without_event.slug in slugs_without
    assert with_event.slug not in slugs_without


def test_activity_detail_returns_event_null_after_event_is_deleted(
    anon_client: APIClient,
    program: Program,
    venue: Venue,
    test_event: Event,
) -> None:
    start = timezone.now() + timedelta(days=14)
    linked = Activity.objects.create(
        program=program,
        venue=venue,
        event=test_event,
        title="Activitat amb event esborrat",
        category="music",
        start_at=start,
        end_at=start + timedelta(hours=1),
        is_free=True,
        status=ActivityStatusChoices.PUBLISHED,
    )

    slug = linked.slug
    test_event.delete()
    linked.refresh_from_db()
    assert linked.event_id is None

    response = anon_client.get(reverse("activity-detail", kwargs={"slug": slug}))
    assert response.status_code == status.HTTP_200_OK
    assert response.data["event"] is None


def test_activities_filter_unlinked_includes_unlink_and_deleted_event(
    anon_client: APIClient,
    admin_api_client: APIClient,
    program: Program,
    venue: Venue,
    test_event: Event,
) -> None:
    start = timezone.now() + timedelta(days=15)
    keep_linked = Activity.objects.create(
        program=program,
        venue=venue,
        event=test_event,
        title="Mantiene vinculo",
        category="music",
        start_at=start,
        end_at=start + timedelta(hours=1),
        is_free=True,
        status=ActivityStatusChoices.PUBLISHED,
    )
    explicitly_unlinked = Activity.objects.create(
        program=program,
        venue=venue,
        event=test_event,
        title="Se desvincula por API",
        category="music",
        start_at=start + timedelta(days=1),
        end_at=start + timedelta(days=1, hours=1),
        is_free=True,
        status=ActivityStatusChoices.PUBLISHED,
    )
    to_be_deleted_event = Event.objects.create(
        title="Event temporal",
        summary="Event per provar set null",
        description="Event que sera esborrat",
        category=program.festa.category,
        start_at=timezone.now(),
        end_at=timezone.now() + timedelta(hours=2),
        is_published=True,
    )
    unlinked_by_delete = Activity.objects.create(
        program=program,
        venue=venue,
        event=to_be_deleted_event,
        title="Queda orfe en borrar event",
        category="music",
        start_at=start + timedelta(days=2),
        end_at=start + timedelta(days=2, hours=1),
        is_free=True,
        status=ActivityStatusChoices.PUBLISHED,
    )

    unlink_response = admin_api_client.patch(
        reverse("activity-detail", kwargs={"slug": explicitly_unlinked.slug}),
        {"event": None},
        format="json",
    )
    assert unlink_response.status_code == status.HTTP_200_OK
    assert unlink_response.data["event"] is None

    to_be_deleted_event.delete()
    unlinked_by_delete.refresh_from_db()
    assert unlinked_by_delete.event_id is None

    response_unlinked = anon_client.get(
        reverse("activity-list"), {"has_event": "false"}
    )
    assert response_unlinked.status_code == status.HTTP_200_OK
    unlinked_slugs = {item["slug"] for item in response_unlinked.data["results"]}
    assert explicitly_unlinked.slug in unlinked_slugs
    assert unlinked_by_delete.slug in unlinked_slugs
    assert keep_linked.slug not in unlinked_slugs

    response_linked = anon_client.get(reverse("activity-list"), {"has_event": "true"})
    assert response_linked.status_code == status.HTTP_200_OK
    linked_slugs = {item["slug"] for item in response_linked.data["results"]}
    assert keep_linked.slug in linked_slugs
    assert explicitly_unlinked.slug not in linked_slugs
    assert unlinked_by_delete.slug not in linked_slugs


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
