"""Comprehensive model tests for festes programming entities."""

# pyright: reportMissingImports=false

from __future__ import annotations

from datetime import timedelta

import pytest  # type: ignore
from django.core.exceptions import ValidationError
from django.utils import timezone

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


@pytest.fixture
def venue() -> Venue:
    return Venue.objects.create(
        name="Placa Major",
        address="Placa Major, 1",
        city="Cabrera de Mar",
        latitude=41.52,
        longitude=2.39,
        is_published=True,
        is_accessible=True,
    )


def test_program_generates_unique_slug_and_publication_state(
    festa: Festa,
) -> None:
    first = Program.objects.create(festa=festa, title="Nit Jove")
    second = Program.objects.create(festa=festa, title="Nit Jove")

    assert first.slug.startswith(f"{festa.slug}-nit-jove")
    assert second.slug != first.slug
    assert first.is_published is False


def test_program_computed_properties(program: Program, venue: Venue) -> None:
    start = timezone.now() + timedelta(days=1)
    Activity.objects.create(
        program=program,
        venue=venue,
        title="Concert",
        category="music",
        start_at=start,
        end_at=start + timedelta(hours=2),
        status=ActivityStatusChoices.PUBLISHED,
    )

    program.refresh_from_db()
    assert program.activities_count == 1
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


def test_activity_generates_unique_slug_and_aliases(
    program: Program, venue: Venue
) -> None:
    start = timezone.now() + timedelta(days=4)
    first = Activity.objects.create(
        program=program,
        venue=venue,
        title="Sardanes",
        category="tradition",
        start_at=start,
        end_at=start + timedelta(hours=1),
        status=ActivityStatusChoices.PUBLISHED,
    )
    second = Activity.objects.create(
        program=program,
        venue=venue,
        title="Sardanes",
        category="tradition",
        start_at=start,
        end_at=start + timedelta(hours=1),
        status=ActivityStatusChoices.PUBLISHED,
    )

    assert first.slug != second.slug
    assert first.is_published is True
    assert first.created_at is not None
    assert first.updated_at is not None
