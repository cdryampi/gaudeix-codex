"""URL configuration for the festes app."""

from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import FestaViewSet, SponsorViewSet


def register_routes(router: DefaultRouter) -> None:
    """Register Festa routes on the shared router."""
    router.register(r"festes", FestaViewSet, basename="festa")
    router.register(r"sponsors", SponsorViewSet, basename="sponsor")


# Standalone usage (optional) if this file is included directly.
router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
