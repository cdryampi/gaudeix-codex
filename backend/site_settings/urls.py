from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import (
    FooterBadgeViewSet,
    FooterLinkViewSet,
    FooterSettingsViewSet,
    MenuItemViewSet,
    SiteSettingsViewSet,
)


def register_routes(router: DefaultRouter):
    router.register(r"site-settings", SiteSettingsViewSet, basename="site-settings")
    router.register(r"menu-items", MenuItemViewSet, basename="menu-items")
    router.register(
        r"footer-settings", FooterSettingsViewSet, basename="footer-settings"
    )
    router.register(r"footer-links", FooterLinkViewSet, basename="footer-links")
    router.register(r"footer-badges", FooterBadgeViewSet, basename="footer-badges")


__all__ = ["register_routes"]
