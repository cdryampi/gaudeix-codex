# Serializers for registration endpoints without deprecated settings usage.
from __future__ import annotations

from typing import Any, cast

from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from allauth.account import app_settings as allauth_account_settings
from allauth.account.adapter import get_adapter
from allauth.account.models import EmailAddress
from allauth.account.utils import setup_user_email
from allauth.utils import get_username_max_length


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(
        max_length=get_username_max_length(),
        min_length=allauth_account_settings.USERNAME_MIN_LENGTH,
        required=False,
    )
    email = serializers.EmailField(required=False)
    password1 = serializers.CharField(write_only=True, required=False)
    password2 = serializers.CharField(write_only=True, required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        signup_fields = cast(
            dict[str, dict[str, bool]], allauth_account_settings.SIGNUP_FIELDS
        )
        self._apply_signup_fields(signup_fields)

    def _apply_signup_fields(self, signup_fields: dict) -> None:
        fields = cast(dict[str, serializers.Field], self.fields)
        for field_name in ("username", "email", "password1", "password2"):
            config = signup_fields.get(field_name)
            if not config:
                fields.pop(field_name, None)
                continue
            fields[field_name].required = config.get("required", False)

    def validate_username(self, username):
        return get_adapter().clean_username(username)

    def validate_email(self, email):
        email = get_adapter().clean_email(email)
        if allauth_account_settings.UNIQUE_EMAIL and email:
            if EmailAddress.objects.is_verified(email):
                raise serializers.ValidationError(
                    _("A user is already registered with this e-mail address."),
                )
        return email

    def validate_password1(self, password):
        return get_adapter().clean_password(password)

    def validate(self, attrs):
        fields = cast(dict[str, serializers.Field], self.fields)
        if "password2" in fields:
            if attrs.get("password1") != attrs.get("password2"):
                raise serializers.ValidationError(
                    _("The two password fields didn't match.")
                )
        return attrs

    def custom_signup(self, request, user):
        return None

    def get_cleaned_data(self):
        validated = cast(dict[str, Any], self.validated_data)
        return {
            "username": validated.get("username", ""),
            "password1": validated.get("password1", ""),
            "email": validated.get("email", ""),
        }

    def save(self, **kwargs):
        request = kwargs.get("request")
        adapter = get_adapter()
        user = adapter.new_user(request)
        self.cleaned_data = self.get_cleaned_data()
        user = adapter.save_user(request, user, self, commit=False)
        if "password1" in self.cleaned_data:
            try:
                adapter.clean_password(self.cleaned_data["password1"], user=user)
            except DjangoValidationError as exc:
                raise serializers.ValidationError(
                    detail=serializers.as_serializer_error(exc),
                )
        user.save()
        self.custom_signup(request, user)
        setup_user_email(request, user, [])
        return user


class VerifyEmailSerializer(serializers.Serializer):
    key = serializers.CharField(write_only=True)


class ResendEmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
