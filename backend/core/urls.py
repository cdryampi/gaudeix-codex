from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet


def register_routes(router: DefaultRouter) -> None:
    """
    Register core routes (categories).
    """
    router.register(r"categories", CategoryViewSet, basename="category")


router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
