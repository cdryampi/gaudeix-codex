from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import PlaceViewSet, RestaurantViewSet, AccommodationViewSet


def register_routes(router: DefaultRouter) -> None:
    """
    Register Place routes on the shared router.
    """
    router.register(r"places", PlaceViewSet, basename="place")
    router.register(r"restaurants", RestaurantViewSet, basename="restaurant")
    router.register(r"accommodations", AccommodationViewSet, basename="accommodation")


# Standalone usage (optional) if this file is included directly.
router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
