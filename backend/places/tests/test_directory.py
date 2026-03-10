import pytest
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Category
from places.models import Beach, Restaurant, Accommodation, PlaceCategorySingleton


@pytest.mark.django_db
class TestDirectoryAPI:
    def setup_method(self):
        self.client = APIClient()
        # Setup required category infrastructure
        self.category = Category.objects.create(slug="places", nombre="Places")
        self.beaches_category = Category.objects.create(
            slug="beaches", nombre="Playas", taxonomy="template"
        )

        # Ensure singleton exists and points to valid category
        # Cannot use get_or_create without defaults because category is required
        if PlaceCategorySingleton.objects.exists():
            singleton = PlaceCategorySingleton.objects.first()
            singleton.category = self.category
            singleton.save()
        else:
            PlaceCategorySingleton.objects.create(category=self.category)

    def test_create_restaurant(self, admin_user):
        self.client.force_authenticate(user=admin_user)
        payload = {
            "title": "La Pizzeria",
            "cuisine_type": "italian",
            "capacity": 50,
            "amenities": {"wifi": True, "terrace": True},
        }
        response = self.client.post("/api/v1/restaurants/", payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["cuisine_type"] == "italian"
        assert response.data["amenities"]["wifi"] is True

        # Verify DB
        assert Restaurant.objects.count() == 1
        rest = Restaurant.objects.first()
        assert rest.title == "La Pizzeria"

    def test_create_accommodation(self, admin_user):
        self.client.force_authenticate(user=admin_user)
        payload = {
            "title": "Hotel Grand",
            "type": "hotel",
            "stars": 5,
            "check_in_time": "14:00",
            "amenities": {"pool": True},
        }
        response = self.client.post("/api/v1/accommodations/", payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["stars"] == 5

        # Verify DB
        assert Accommodation.objects.count() == 1

    def test_polymorphic_behavior(self, admin_user):
        # Create one of each
        Restaurant.objects.create(title="Resto 1", cuisine_type="tapas")
        Accommodation.objects.create(title="Hotel 1", stars=3)
        Beach.objects.create(title="Platja 1")

        # /places/ should list generic places only, excluding specialized beaches
        response = self.client.get("/api/v1/places/")
        assert response.status_code == status.HTTP_200_OK

        # Handle pagination or list response
        results = (
            response.data["results"] if "results" in response.data else response.data
        )
        assert len(results) >= 2
        assert all(item["template_key"] != "beaches" for item in results)

        # /restaurants/ should list only restaurants
        response_rest = self.client.get("/api/v1/restaurants/")
        assert response_rest.status_code == status.HTTP_200_OK

        rest_results = (
            response_rest.data["results"]
            if "results" in response_rest.data
            else response_rest.data
        )
        # Filter by created ones to ignore seeds
        filtered_results = [r for r in rest_results if r["title"] == "Resto 1"]
        assert len(filtered_results) == 1
        assert "cuisine_type" in filtered_results[0]
