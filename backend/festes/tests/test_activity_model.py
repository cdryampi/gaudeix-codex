"""Model-level tests for festes Activity business rules."""

from datetime import timedelta

import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone

from core.models import Category
from festes.models import (
    Activity,
    ActivityStatusChoices,
    Festa,
    Program,
    Venue,
)

pytestmark = pytest.mark.django_db


@pytest.fixture
def festa_category() -> Category:
    return Category.objects.create(
        slug="festes",
        taxonomy="festes",
        nombre="Festes",
    )


@pytest.fixture
def festa(festa_category: Category) -> Festa:
    return Festa.objects.create(
        title="Festa Major",
        year=2026,
        start_date=timezone.localdate(),
        end_date=timezone.localdate() + timedelta(days=1),
        category=festa_category,
    )


@pytest.fixture
def program(festa: Festa) -> Program:
    return Program.objects.create(
        festa=festa,
        title="Programa Principal",
    )


@pytest.fixture
def venue() -> Venue:
    return Venue.objects.create(
        name="Placa Major",
        address="Placa Major, 1",
        city="Cabrera de Mar",
        is_published=True,
    )


def test_activity_slug_and_status_properties(program: Program):
    activity = Activity.objects.create(
        program=program,
        title="Concert Jove",
        category="music",
        status=ActivityStatusChoices.DRAFT,
    )

    assert activity.slug.startswith("festa-major-2026-programa-principal-concert-jove")
    assert activity.is_published is False


def test_activity_rejects_invalid_time_range(program: Program, venue: Venue):
    start = timezone.now()
    end = start - timedelta(hours=1)

    with pytest.raises(ValidationError, match="End date cannot be before start date"):
        Activity.objects.create(
            program=program,
            venue=venue,
            title="Acte invalid",
            category="music",
            start_at=start,
            end_at=end,
        )


def test_activity_rejects_price_when_free(program: Program):
    with pytest.raises(
        ValidationError, match="Price must be null or zero when activity is free"
    ):
        Activity.objects.create(
            program=program,
            title="Taller",
            category="workshop",
            is_free=True,
            price=10,
        )


def test_activity_requires_positive_price_when_not_free(program: Program):
    with pytest.raises(
        ValidationError, match="Price is required when activity is not free"
    ):
        Activity.objects.create(
            program=program,
            title="Show",
            category="show",
            is_free=False,
            price=None,
        )


def test_activity_publish_requires_published_venue_and_valid_range(program: Program):
    start = timezone.now()
    end = start + timedelta(hours=2)
    unpublished_venue = Venue.objects.create(
        name="Sala tancada",
        address="Carrer 1",
        city="Cabrera de Mar",
        is_published=False,
    )

    with pytest.raises(
        ValidationError, match="Published activities require a published venue"
    ):
        Activity.objects.create(
            program=program,
            venue=unpublished_venue,
            title="Concert",
            category="music",
            start_at=start,
            end_at=end,
            status=ActivityStatusChoices.PUBLISHED,
        )

    with pytest.raises(ValidationError, match="Published activities require a venue"):
        Activity.objects.create(
            program=program,
            title="Concert sense venue",
            category="music",
            start_at=start,
            end_at=end,
            status=ActivityStatusChoices.PUBLISHED,
        )


def test_activity_publish_with_valid_data(program: Program, venue: Venue):
    start = timezone.now()
    end = start + timedelta(hours=2)

    activity = Activity.objects.create(
        program=program,
        venue=venue,
        title="Acte publicat",
        category="music",
        start_at=start,
        end_at=end,
        status=ActivityStatusChoices.PUBLISHED,
        is_free=False,
        price=12,
    )

    assert activity.is_published is True
    assert activity.start_at == start
    assert activity.end_at == end
