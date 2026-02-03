"""URL configuration for the routes app."""

from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import RouteViewSet


def register_routes(router: DefaultRouter) -> None:
    """Register Route routes on the shared router."""
    router.register(r"routes", RouteViewSet, basename="route")


# Standalone usage (optional) if this file is included directly.
router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
