from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category
from places.models import Place
from routes.models import Route, RouteWaypoint

User = get_user_model()

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
        slug="coastal-loop",
        title="Coastal Loop",
        category=routes_category,
        route_type="walking",
        difficulty="moderate",
        is_circular=True,
        is_published=True,
        distance_km=12.40,
        duration_minutes=215,
        elevation_gain=430,
        elevation_loss=420,
        start_latitude=41.6205,
        start_longitude=2.6878,
        end_latitude=41.6400,
        end_longitude=2.7050,
        track_geojson={
            "type": "LineString",
            "coordinates": [[2.6878, 41.6205], [2.6960, 41.6290], [2.7050, 41.6400]],
        },
    )


@pytest.fixture
def unpublished_route(routes_category: Category) -> Route:
    return Route.objects.create(
        slug="secret-path",
        title="Secret Path",
        category=routes_category,
        route_type="walking",
        difficulty="easy",
        is_circular=False,
        is_published=False,
    )


@pytest.fixture
def places_category() -> Category:
    category, _ = Category.objects.get_or_create(
        slug="places", defaults={"taxonomy": "places", "nombre": "Places"}
    )
    return category


def _create_place(
    *,
    category: Category,
    slug: str,
    title: str,
    lat: float | None,
    lng: float | None,
) -> Place:
    return Place.objects.create(
        slug=slug,
        title=title,
        category=category,
        latitude=lat,
        longitude=lng,
        is_published=True,
    )


def test_itinerary_happy_path_returns_track_waypoints_segments_and_summary(
    published_route, places_category
):
    place_a = _create_place(
        category=places_category,
        slug="mirador",
        title="Mirador",
        lat=41.6222,
        lng=2.6899,
    )
    place_b = _create_place(
        category=places_category,
        slug="font",
        title="Font",
        lat=41.6333,
        lng=2.7001,
    )

    RouteWaypoint.objects.create(
        route=published_route,
        place=place_a,
        order=1,
        instructions="Take the old path",
    )
    RouteWaypoint.objects.create(
        route=published_route,
        place=place_b,
        order=2,
        instructions="Turn right at the pine",
        distance_from_previous_km=3.25,
    )

    client = APIClient()
    response = client.get(reverse("route-itinerary", kwargs={"slug": published_route.slug}))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["route"]["slug"] == "coastal-loop"
    assert response.data["route"]["title"] == "Coastal Loop"
    assert response.data["start"] == {"lat": 41.6205, "lng": 2.6878}
    assert response.data["end"] == {"lat": 41.64, "lng": 2.705}
    assert response.data["track_geojson"]["type"] == "LineString"

    assert len(response.data["waypoints"]) == 2
    assert response.data["waypoints"][0]["order"] == 1
    assert response.data["waypoints"][0]["place_slug"] == "mirador"
    assert response.data["waypoints"][1]["distance_from_previous_km"] == 3.25

    assert response.data["segments"] == [
        {
            "from_order": 1,
            "to_order": 2,
            "distance_km": 3.25,
            "duration_minutes": None,
        }
    ]

    assert response.data["summary"] == {
        "distance_km": 12.4,
        "duration_minutes": 215,
        "elevation_gain": 430,
        "elevation_loss": 420,
        "waypoints_count": 2,
    }
    assert response.data["bounds"] == {
        "south": 41.6205,
        "west": 2.6878,
        "north": 41.64,
        "east": 2.705,
    }


def test_itinerary_fallback_without_track_handles_partial_coordinates(
    published_route, places_category
):
    published_route.track_geojson = None
    published_route.start_latitude = None
    published_route.start_longitude = None
    published_route.end_latitude = None
    published_route.end_longitude = None
    published_route.save(
        update_fields=[
            "track_geojson",
            "start_latitude",
            "start_longitude",
            "end_latitude",
            "end_longitude",
        ]
    )

    place_with_coords = _create_place(
        category=places_category,
        slug="chapel",
        title="Chapel",
        lat=41.6120,
        lng=2.6750,
    )
    place_without_coords = _create_place(
        category=places_category,
        slug="square",
        title="Square",
        lat=None,
        lng=None,
    )

    RouteWaypoint.objects.create(route=published_route, place=place_without_coords, order=1)
    RouteWaypoint.objects.create(route=published_route, place=place_with_coords, order=2)

    client = APIClient()
    response = client.get(reverse("route-itinerary", kwargs={"slug": published_route.slug}))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["start"] is None
    assert response.data["end"] is None
    assert response.data["track_geojson"] is None
    assert response.data["bounds"] == {
        "south": 41.612,
        "west": 2.675,
        "north": 41.612,
        "east": 2.675,
    }


def test_itinerary_unpublished_route_returns_404_for_anonymous(unpublished_route):
    client = APIClient()
    response = client.get(reverse("route-itinerary", kwargs={"slug": unpublished_route.slug}))

    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_itinerary_unpublished_route_allows_staff(unpublished_route):
    staff_user = User.objects.create_user(
        username="route-admin", password="secret", is_staff=True
    )
    client = APIClient()
    client.force_authenticate(user=staff_user)

    response = client.get(reverse("route-itinerary", kwargs={"slug": unpublished_route.slug}))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["route"]["slug"] == "secret-path"


def test_public_list_and_retrieve_only_expose_published(routes_category):
    published = Route.objects.create(
        slug="public-route",
        title="Public Route",
        category=routes_category,
        route_type="walking",
        difficulty="easy",
        is_published=True,
    )
    Route.objects.create(
        slug="private-route",
        title="Private Route",
        category=routes_category,
        route_type="walking",
        difficulty="easy",
        is_published=False,
    )

    client = APIClient()

    list_response = client.get(reverse("route-list"))
    assert list_response.status_code == status.HTTP_200_OK
    assert [item["slug"] for item in list_response.data] == [published.slug]

    retrieve_response = client.get(reverse("route-detail", kwargs={"slug": published.slug}))
    assert retrieve_response.status_code == status.HTTP_200_OK

    hidden_response = client.get(reverse("route-detail", kwargs={"slug": "private-route"}))
    assert hidden_response.status_code == status.HTTP_404_NOT_FOUND
