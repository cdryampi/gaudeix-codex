from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import SiteSettingsViewSet


def register_routes(router: DefaultRouter):
    router.register(r"site-settings", SiteSettingsViewSet, basename="site-settings")


__all__ = ["register_routes"]
