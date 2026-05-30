from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, DashboardViewSet, TagViewSet


def register_routes(router: DefaultRouter) -> None:
    """
    Register core routes (categories, dashboard).
    """
    router.register(r"categories", CategoryViewSet, basename="category")
    router.register(r"tags", TagViewSet, basename="tag")
    router.register(r"dashboard", DashboardViewSet, basename="dashboard")


router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
