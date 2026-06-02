from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import StoryViewSet


def register_routes(router: DefaultRouter) -> None:
    """
    Register Story routes on the shared router.
    """
    router.register(r"stories", StoryViewSet, basename="story")


router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
