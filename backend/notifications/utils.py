"""Utility functions for sending notifications and push messages."""

from __future__ import annotations

from django.conf import settings
from django.utils import timezone

from .models import DeviceToken, Notification


def _send_via_firebase(tokens: list[str], title: str, body: str, data: dict) -> bool:
    try:
        import firebase_admin
        from firebase_admin import credentials, messaging
    except Exception:
        return False

    if not tokens:
        return True

    if not firebase_admin._apps:
        credentials_path = getattr(settings, "FCM_CREDENTIALS_FILE", "")
        if credentials_path:
            cred = credentials.Certificate(credentials_path)
            firebase_admin.initialize_app(cred)
        else:
            try:
                firebase_admin.initialize_app()
            except Exception:
                return False

    message = messaging.MulticastMessage(
        notification=messaging.Notification(title=title, body=body),
        data={k: str(v) for k, v in (data or {}).items()},
        tokens=tokens,
    )
    if hasattr(messaging, "send_each_for_multicast"):
        messaging.send_each_for_multicast(message)
    else:
        messaging.send_multicast(message)
    return True


def create_notification(
    *,
    user,
    title: str,
    body: str,
    notification_type: str,
    data: dict | None = None,
) -> Notification:
    return Notification.objects.create(
        user=user,
        title=title,
        body=body,
        notification_type=notification_type,
        data=data or {},
        sent_at=timezone.now(),
    )


def send_push_notification(
    *,
    user,
    title: str,
    body: str,
    notification_type: str,
    data: dict | None = None,
) -> Notification:
    notification = create_notification(
        user=user,
        title=title,
        body=body,
        notification_type=notification_type,
        data=data,
    )

    tokens = list(
        DeviceToken.objects.filter(user=user, is_active=True).values_list(
            "token", flat=True
        )
    )
    _send_via_firebase(tokens, title, body, data or {})
    return notification


def send_broadcast_notification(
    *,
    title: str,
    body: str,
    notification_type: str,
    data: dict | None = None,
) -> Notification:
    notification = create_notification(
        user=None,
        title=title,
        body=body,
        notification_type=notification_type,
        data=data,
    )
    tokens = list(
        DeviceToken.objects.filter(is_active=True).values_list("token", flat=True)
    )
    _send_via_firebase(tokens, title, body, data or {})
    return notification
