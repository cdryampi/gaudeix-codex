"""URL configuration for the festes app."""

from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import (
    FestaViewSet,
    ProgramViewSet,
    SponsorViewSet,
    VenueViewSet,
)


def register_routes(router: DefaultRouter) -> None:
    """Register Festa routes on the shared router."""
    router.register(r"festes", FestaViewSet, basename="festa")
    router.register(r"sponsors", SponsorViewSet, basename="sponsor")
    router.register(r"programs", ProgramViewSet, basename="program")
    router.register(r"venues", VenueViewSet, basename="venue")


# Standalone usage (optional) if this file is included directly.
router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
