from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import (
    BeachSafetyAutomationRunViewSet,
    BeachSafetyProposalViewSet,
    BeachSafetyStatusViewSet,
)


def register_routes(router: DefaultRouter) -> None:
    router.register(
        r"beach-safety-status",
        BeachSafetyStatusViewSet,
        basename="beach-safety-status",
    )
    router.register(
        r"beach-safety-proposals",
        BeachSafetyProposalViewSet,
        basename="beach-safety-proposal",
    )
    router.register(
        r"beach-safety-runs",
        BeachSafetyAutomationRunViewSet,
        basename="beach-safety-run",
    )


router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
