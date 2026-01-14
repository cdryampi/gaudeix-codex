"""API tests for notifications endpoints."""

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from notifications.models import DeviceToken, Notification
from notifications import utils as notification_utils

User = get_user_model()

pytestmark = pytest.mark.django_db


def test_device_registration_and_delete():
    user = User.objects.create_user(username="deviceuser", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)

    url = reverse("device-list")
    payload = {"token": "token-123", "platform": "android", "is_active": True}
    response = client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert DeviceToken.objects.filter(user=user, token="token-123").exists()

    delete_url = reverse("device-detail", kwargs={"token": "token-123"})
    delete_response = client.delete(delete_url)

    assert delete_response.status_code == status.HTTP_204_NO_CONTENT
    assert not DeviceToken.objects.filter(user=user, token="token-123").exists()


def test_notifications_list_and_unread_count():
    user = User.objects.create_user(username="notifyuser", password="pass123")
    Notification.objects.create(
        user=user,
        title="Aviso",
        body="Mensaje",
        notification_type=Notification.NotificationType.GENERAL,
    )

    client = APIClient()
    client.force_authenticate(user=user)

    list_url = reverse("notification-list")
    response = client.get(list_url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1

    unread_url = reverse("notification-unread-count")
    unread_response = client.get(unread_url)

    assert unread_response.status_code == status.HTTP_200_OK
    assert unread_response.data["unread"] == 1


def test_mark_read_and_mark_all():
    user = User.objects.create_user(username="readuser", password="pass123")
    notification = Notification.objects.create(
        user=user,
        title="Aviso",
        body="Mensaje",
        notification_type=Notification.NotificationType.GENERAL,
    )

    client = APIClient()
    client.force_authenticate(user=user)

    read_url = reverse("notification-mark-read", kwargs={"pk": notification.pk})
    response = client.patch(read_url, {}, format="json")

    assert response.status_code == status.HTTP_200_OK
    notification.refresh_from_db()
    assert notification.read is True

    Notification.objects.create(
        user=user,
        title="Aviso 2",
        body="Mensaje",
        notification_type=Notification.NotificationType.GENERAL,
    )
    mark_all_url = reverse("notification-mark-all-read")
    mark_all_response = client.post(mark_all_url)

    assert mark_all_response.status_code == status.HTTP_204_NO_CONTENT
    assert Notification.objects.filter(user=user, read=False).count() == 0


def test_admin_can_create_notification(monkeypatch):
    def fake_send(tokens, title, body, data):
        return True

    monkeypatch.setattr(notification_utils, "_send_via_firebase", fake_send)

    admin = User.objects.create_user(
        username="staff", password="pass123", is_staff=True
    )
    target = User.objects.create_user(username="target", password="pass123")
    client = APIClient()
    client.force_authenticate(user=admin)

    url = reverse("notification-list")
    payload = {
        "title": "Aviso",
        "body": "Mensaje",
        "notification_type": Notification.NotificationType.GENERAL,
        "user_id": target.id,
    }
    response = client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert Notification.objects.filter(user=target).count() == 1


def test_non_staff_cannot_create_notification():
    user = User.objects.create_user(username="basic", password="pass123")
    client = APIClient()
    client.force_authenticate(user=user)

    url = reverse("notification-list")
    payload = {
        "title": "Aviso",
        "body": "Mensaje",
        "notification_type": Notification.NotificationType.GENERAL,
    }
    response = client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_403_FORBIDDEN
