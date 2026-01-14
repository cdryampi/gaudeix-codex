"""Serializers for notifications endpoints."""

from rest_framework import serializers

from .models import DeviceToken, Notification


class DeviceTokenSerializer(serializers.ModelSerializer):
    """Serializer for registering device tokens."""

    class Meta:
        model = DeviceToken
        fields = ["token", "platform", "is_active", "created_at", "last_used"]
        read_only_fields = ["created_at", "last_used"]


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notification list and detail."""

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "body",
            "notification_type",
            "data",
            "read",
            "sent_at",
            "created_at",
        ]
        read_only_fields = ["id", "sent_at", "created_at"]
