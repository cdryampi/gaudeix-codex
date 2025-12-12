from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import MenuItemViewSet, SiteSettingsViewSet


def register_routes(router: DefaultRouter):
    router.register(r"site-settings", SiteSettingsViewSet, basename="site-settings")
    router.register(r"menu-items", MenuItemViewSet, basename="menu-items")


__all__ = ["register_routes"]
