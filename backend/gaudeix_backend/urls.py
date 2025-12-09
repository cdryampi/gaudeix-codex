"""URL configuration for gaudeix_backend project."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from events.urls import register_routes as register_events_routes
from places.urls import register_routes as register_places_routes
from media_files.urls import register_routes as register_media_routes
from social.urls import register_routes as register_social_routes
from users.urls import register_routes as register_users_routes
from llm_translations.urls import register_routes as register_llm_routes
from .views import health_check

# Register DRF router routes
router = DefaultRouter()
register_events_routes(router)
register_places_routes(router)
register_media_routes(router)
register_social_routes(router)
register_users_routes(router)
register_llm_routes(router)

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    
    # Health check (public endpoint)
    path("api/health/", health_check, name="health_check"),
    
    # API v1 - Authentication
    path("api/v1/auth/", include("dj_rest_auth.urls")),
    path("api/v1/auth/registration/", include("dj_rest_auth.registration.urls")),
    
    # API v1 - Users (includes password reset URLs)
    path("api/v1/", include("users.urls")),
    
    # API v1 - Router (users, media, social viewsets)
    path("api/v1/", include(router.urls)),
    
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
