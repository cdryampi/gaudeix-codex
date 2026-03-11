from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import AutomationJobViewSet, AutomationTemplateViewSet


def register_routes(router: DefaultRouter) -> None:
    router.register(
        r"automation-templates",
        AutomationTemplateViewSet,
        basename="automation-template",
    )
    router.register(
        r"automations",
        AutomationJobViewSet,
        basename="automation",
    )


router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
