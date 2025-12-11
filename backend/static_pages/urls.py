from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import StaticPageViewSet


def register_routes(router: DefaultRouter):
    router.register(r"static-pages", StaticPageViewSet, basename="staticpage")


__all__ = ["register_routes"]
