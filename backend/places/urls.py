from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import PlaceViewSet


def register_routes(router: DefaultRouter) -> None:
    """
    Register Place routes on the shared router.
    """
    router.register(r"places", PlaceViewSet, basename="place")


# Standalone usage (optional) if this file is included directly.
router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
