"""URL registration for notifications endpoints."""

from rest_framework.routers import DefaultRouter

from .views import DeviceTokenViewSet, NotificationViewSet


def register_routes(router: DefaultRouter) -> None:
    """Register notifications routes on the shared router."""
    router.register(r"devices", DeviceTokenViewSet, basename="device")
    router.register(r"notifications", NotificationViewSet, basename="notification")


router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
