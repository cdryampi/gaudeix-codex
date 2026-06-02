"""
URL configuration for the Users app.
"""
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    LoginView,
)

def register_routes(router: DefaultRouter):
    """
    Registers the Users app routes with the provided router.

    Args:
        router (DefaultRouter): The main application router.
    """
    router.register(r'users', UserViewSet, basename='user')

# Router for standalone usage (optional)
router = DefaultRouter()
register_routes(router)

# Additional URLs not handled by the router
urlpatterns = [
    path('users/login/', LoginView.as_view(), name='login'),
    path('users/password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('users/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    *router.urls,
]
