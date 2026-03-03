from __future__ import annotations

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category
from routes.models import Route, RouteCheckpoint

pytestmark = pytest.mark.django_db


@pytest.fixture
def routes_category() -> Category:
    category, _ = Category.objects.get_or_create(
        slug="routes", defaults={"taxonomy": "routes", "nombre": "Routes"}
    )
    return category


@pytest.fixture
def published_route(routes_category: Category) -> Route:
    return Route.objects.create(
        slug="roadmap-route",
        title="Roadmap Route",
        category=routes_category,
        route_type="mixed",
        difficulty="moderate",
        is_circular=False,
        is_published=True,
        distance_km=25.0,
        start_latitude=41.5,
        start_longitude=2.5,
        end_latitude=41.6,
        end_longitude=2.6,
    )


def test_itinerary_with_checkpoints_returns_correct_data_and_bounds(published_route):
    # Create checkpoints
    RouteCheckpoint.objects.create(
        route=published_route,
        order=1,
        title="Start Village",
        description="Beginning of the route",
        latitude=41.5,
        longitude=2.5,
        is_active=True,
    )
    RouteCheckpoint.objects.create(
        route=published_route,
        order=2,
        title="Midpoint Town",
        latitude=41.55,
        longitude=2.55,
        is_active=True,
    )
    RouteCheckpoint.objects.create(
        route=published_route,
        order=3,
        title="Hidden Hamlet",
        latitude=42.0,
        longitude=3.0,
        is_active=False,  # Should be ignored
    )
    RouteCheckpoint.objects.create(
        route=published_route,
        order=4,
        title="End City",
        latitude=41.6,
        longitude=2.6,
        is_active=True,
    )

    client = APIClient()
    response = client.get(reverse("route-itinerary", kwargs={"slug": published_route.slug}))

    assert response.status_code == status.HTTP_200_OK
    data = response.data

    # Check checkpoints are returned correctly to the frontend
    assert "checkpoints" in data
    assert len(data["checkpoints"]) == 3  # Only active ones
    assert data["checkpoints"][0]["title"] == "Start Village"
    assert data["checkpoints"][0]["order"] == 1
    assert data["checkpoints"][1]["title"] == "Midpoint Town"
    assert data["checkpoints"][2]["title"] == "End City"

    # Bounds should include the checkpoints
    bounds = data["bounds"]
    assert bounds is not None
    assert bounds["south"] == 41.5
    assert bounds["north"] == 41.6
    assert bounds["west"] == 2.5
    assert bounds["east"] == 2.6

    # Summary should include checkpoints count
    assert data["summary"]["checkpoints_count"] == 3
    assert data["summary"]["distance_km"] == 25.0


def test_itinerary_without_coordinates_handles_gracefully(published_route):
    published_route.start_latitude = None
    published_route.start_longitude = None
    published_route.end_latitude = None
    published_route.end_longitude = None
    published_route.save()

    client = APIClient()
    response = client.get(reverse("route-itinerary", kwargs={"slug": published_route.slug}))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["bounds"] is None
