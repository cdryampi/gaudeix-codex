# Custom registration views that avoid deprecated allauth settings.
from __future__ import annotations

from typing import Any, Callable, cast

from django.utils.decorators import method_decorator
from django.utils.translation import gettext_lazy as _
from django.views.decorators.debug import sensitive_post_parameters
from rest_framework import status
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from allauth.account import app_settings as allauth_account_settings
from allauth.account.models import EmailAddress
from allauth.account.utils import complete_signup
from allauth.account.views import ConfirmEmailView

from dj_rest_auth.app_settings import api_settings
from dj_rest_auth.models import TokenModel
from dj_rest_auth.utils import jwt_encode

from .registration_serializers import (
    RegisterSerializer,
    ResendEmailVerificationSerializer,
    VerifyEmailSerializer,
)


sensitive_post_parameters_m = method_decorator(
    sensitive_post_parameters("password1", "password2"),
)


class RegisterView(CreateAPIView):
    """
    Registers a new user.

    Accepts the following POST parameters: username, email, password1, password2.
    """

    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)
    token_model = TokenModel
    throttle_scope = "dj_rest_auth"

    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get_response_data(self, user):
        if (
            allauth_account_settings.EMAIL_VERIFICATION
            == allauth_account_settings.EmailVerificationMethod.MANDATORY
        ):
            return {"detail": _("Verification e-mail sent.")}

        if api_settings.USE_JWT:
            data = {
                "user": user,
                "access": self.access_token,
                "refresh": self.refresh_token,
            }
            jwt_serializer = cast(Callable[..., Any], api_settings.JWT_SERIALIZER)
            return jwt_serializer(data, context=self.get_serializer_context()).data
        if self.token_model:
            token_serializer = cast(Callable[..., Any], api_settings.TOKEN_SERIALIZER)
            return token_serializer(
                user.auth_token, context=self.get_serializer_context()
            ).data
        return None

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        data = self.get_response_data(user)

        if data:
            response = Response(data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            response = Response(status=status.HTTP_204_NO_CONTENT, headers=headers)

        return response

    def perform_create(self, serializer):
        user = serializer.save(request=self.request)
        if (
            allauth_account_settings.EMAIL_VERIFICATION
            != allauth_account_settings.EmailVerificationMethod.MANDATORY
        ):
            if api_settings.USE_JWT:
                self.access_token, self.refresh_token = jwt_encode(user)
            elif self.token_model:
                api_settings.TOKEN_CREATOR(self.token_model, user, serializer)

        complete_signup(
            self.request._request,
            user,
            allauth_account_settings.EMAIL_VERIFICATION,
            None,
        )
        return user


class VerifyEmailView(APIView, ConfirmEmailView):
    """
    Verifies the email associated with the provided key.

    Accepts the following POST parameter: key.
    """

    permission_classes = (AllowAny,)
    http_method_names = ["post", "options", "head"]

    def get_serializer(self, *args, **kwargs):
        return VerifyEmailSerializer(*args, **kwargs)

    def get(self, *args, **kwargs):
        raise MethodNotAllowed("GET")

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = cast(dict[str, Any], serializer.validated_data)
        self.kwargs["key"] = validated["key"]
        confirmation = self.get_object()
        confirmation.confirm(self.request)
        return Response({"detail": _("ok")}, status=status.HTTP_200_OK)


class ResendEmailVerificationView(CreateAPIView):
    """
    Resends another email to an unverified email.

    Accepts the following POST parameter: email.
    """

    permission_classes = (AllowAny,)
    serializer_class = ResendEmailVerificationSerializer
    queryset = EmailAddress.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = self.get_queryset().filter(**serializer.validated_data).first()
        if email and not email.verified:
            email.send_confirmation(request)

        return Response({"detail": _("ok")}, status=status.HTTP_200_OK)
