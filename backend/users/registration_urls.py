# URLs for custom dj-rest-auth registration endpoints.
from __future__ import annotations

from django.urls import path, re_path
from django.views.generic import TemplateView

from .registration_views import (
    RegisterView,
    ResendEmailVerificationView,
    VerifyEmailView,
)

urlpatterns = [
    path("", RegisterView.as_view(), name="rest_register"),
    re_path(r"verify-email/?$", VerifyEmailView.as_view(), name="rest_verify_email"),
    re_path(
        r"resend-email/?$",
        ResendEmailVerificationView.as_view(),
        name="rest_resend_email",
    ),
    re_path(
        r"^account-confirm-email/(?P<key>[-:\w]+)/$",
        TemplateView.as_view(),
        name="account_confirm_email",
    ),
    re_path(
        r"account-email-verification-sent/?$",
        TemplateView.as_view(),
        name="account_email_verification_sent",
    ),
]
