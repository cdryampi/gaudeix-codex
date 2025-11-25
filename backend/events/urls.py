from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import EventViewSet


def register_routes(router: DefaultRouter) -> None:
    """
    Register Event routes on the shared router.
    """
    router.register(r"events", EventViewSet, basename="event")


# Standalone usage (optional) if this file is included directly.
router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
