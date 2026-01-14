"""URL registration for gamification endpoints."""

from rest_framework.routers import DefaultRouter

from .views import RankingViewSet


def register_routes(router: DefaultRouter) -> None:
    """Register gamification routes on the shared router."""
    router.register(r"ranking", RankingViewSet, basename="ranking")


router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
