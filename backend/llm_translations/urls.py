"""URL configuration for LLM translation API."""

from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import LLMProviderConfigViewSet, TranslationLogViewSet


def register_routes(router: DefaultRouter) -> None:
    """
    Register LLM translation routes on the shared router.
    """
    router.register(r"llm-config", LLMProviderConfigViewSet, basename="llm-config")
    router.register(r"translation-logs", TranslationLogViewSet, basename="translation-log")


# Standalone usage (optional) if this file is included directly.
router = DefaultRouter()
register_routes(router)
urlpatterns = router.urls
