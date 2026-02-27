"""Model tests for festes programming entities without Activity."""

# pyright: reportMissingImports=false

from __future__ import annotations

from datetime import timedelta

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.utils import timezone

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
def festes_category() -> Category:
    return Category.objects.create(
        slug="festes",
        taxonomy="festes",
        nombre="Festes",
    )


@pytest.fixture
def festa(festes_category: Category) -> Festa:
    today = timezone.localdate()
    return Festa.objects.create(
        title="Festa Major",
        year=today.year,
        start_date=today,
        end_date=today + timedelta(days=2),
        category=festes_category,
    )


@pytest.fixture
def program(festa: Festa) -> Program:
    return Program.objects.create(
        festa=festa,
        title="Programa Oficial",
        status=ProgramStatusChoices.PUBLISHED,
        order=1,
    )


def test_program_generates_unique_slug_and_publication_state(festa: Festa) -> None:
    first = Program.objects.create(festa=festa, title="Nit Jove")
    second = Program.objects.create(festa=festa, title="Nit Jove")

    assert first.slug.startswith(f"{festa.slug}-nit-jove")
    assert second.slug != first.slug
    assert first.is_published is False


def test_program_timestamp_aliases(program: Program) -> None:
    assert program.created_at is not None
    assert program.updated_at is not None


def test_venue_slug_location_and_timestamp_aliases() -> None:
    venue = Venue.objects.create(
        name="Can Rodon",
        address="Carrer Nou, 8",
        city="Vilassar de Mar",
        is_published=True,
    )

    assert venue.slug == "can-rodon"
    assert venue.location == "Carrer Nou, 8, Vilassar de Mar"
    assert venue.created_at is not None
    assert venue.updated_at is not None


def test_venue_rejects_invalid_coordinates_range() -> None:
    with pytest.raises(ValidationError, match="Latitud"):
        Venue.objects.create(
            name="Invalid Lat",
            address="X",
            city="Y",
            latitude=120,
            longitude=2,
            is_published=True,
        )

    with pytest.raises(ValidationError, match="Longitud"):
        Venue.objects.create(
            name="Invalid Lng",
            address="X",
            city="Y",
            latitude=10,
            longitude=200,
            is_published=True,
        )


def test_venue_requires_coordinate_pair() -> None:
    with pytest.raises(ValidationError, match="Latitud i longitud"):
        Venue.objects.create(
            name="Half Coordinates",
            address="X",
            city="Y",
            latitude=41.5,
            is_published=True,
        )


def test_festa_event_requires_unique_festa_event_pair(
    festa: Festa,
    festes_category: Category,
) -> None:
    start = timezone.now()
    event = Event.objects.create(
        title="Concert",
        summary="Resumen",
        description="Descripcion",
        category=festes_category,
        start_at=start,
        end_at=start + timedelta(hours=2),
        is_published=True,
    )

    FestaEvent.objects.create(festa=festa, event=event, order=0)

    with pytest.raises(IntegrityError):
        FestaEvent.objects.create(festa=festa, event=event, order=1)
