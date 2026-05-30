"""URL configuration for gaudeix_backend project."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from events.urls import register_routes as register_events_routes
from gamification.urls import register_routes as register_gamification_routes
from notifications.urls import register_routes as register_notifications_routes
from core.urls import register_routes as register_core_routes
from places.urls import register_routes as register_places_routes
from automations.urls import register_routes as register_automation_routes
from beach_safety.urls import register_routes as register_beach_safety_routes
from media_files.urls import register_routes as register_media_routes
from social.urls import register_routes as register_social_routes
from users.urls import register_routes as register_users_routes
from llm_translations.urls import register_routes as register_llm_routes
from static_pages.urls import register_routes as register_static_pages_routes
from site_settings.urls import register_routes as register_site_settings_routes
from news.urls import register_routes as register_news_routes
from routes.urls import register_routes as register_routes_routes
from festes.urls import register_routes as register_festes_routes
from scraper.urls import register_routes as register_scraper_routes
from .views import health_check, landing

# Register DRF router routes
router = DefaultRouter()
register_core_routes(router)
register_events_routes(router)
register_gamification_routes(router)
register_notifications_routes(router)
register_places_routes(router)
register_automation_routes(router)
register_beach_safety_routes(router)
register_media_routes(router)
register_social_routes(router)
register_users_routes(router)
register_llm_routes(router)
register_static_pages_routes(router)
register_site_settings_routes(router)
register_news_routes(router)
register_routes_routes(router)
register_festes_routes(router)
register_scraper_routes(router)

urlpatterns = [
    path("", landing, name="landing"),
    # Admin
    path("admin/", admin.site.urls),
    # Health check (public endpoint)
    path("api/health/", health_check, name="health_check"),
    # API v1 - Authentication
    path("api/v1/auth/", include("dj_rest_auth.urls")),
    path("api/v1/auth/registration/", include("users.registration_urls")),
    # API v1 - Users (includes password reset URLs)
    path("api/v1/", include("users.urls")),
    # API v1 - Router (users, media, social viewsets)
    path("api/v1/", include(router.urls)),
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    path(
        "api/docs/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="developer-docs",
    ),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += staticfiles_urlpatterns()

# Serve media/static files explicitly in local Docker environments where DEBUG stays off
elif getattr(settings, "SERVE_MEDIA_FILES", False) or getattr(settings, "SERVE_STATIC_FILES", False):
    if getattr(settings, "SERVE_MEDIA_FILES", False):
        urlpatterns += [
            re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
        ]
    if getattr(settings, "SERVE_STATIC_FILES", False):
        urlpatterns += [
            re_path(r"^static/(?P<path>.*)$", serve, {"document_root": settings.STATIC_ROOT}),
        ]
