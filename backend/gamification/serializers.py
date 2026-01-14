"""Serializers for gamification API endpoints."""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import EventCheckin, PointTransaction, UserPoints

User = get_user_model()


class BasicUserSerializer(serializers.ModelSerializer):
    """Minimal user serializer for rankings."""

    class Meta:
        model = User
        fields = ["id", "username", "name"]


class UserPointsSerializer(serializers.ModelSerializer):
    """Serializer for user points totals."""

    class Meta:
        model = UserPoints
        fields = ["total_points", "level", "events_completed"]


class PointTransactionSerializer(serializers.ModelSerializer):
    """Serializer for point transactions."""

    event_title = serializers.SerializerMethodField()

    class Meta:
        model = PointTransaction
        fields = [
            "id",
            "points",
            "transaction_type",
            "event",
            "event_title",
            "description",
            "created_at",
        ]
        read_only_fields = fields

    def get_event_title(self, obj: PointTransaction) -> str:
        if not obj.event_id:
            return ""
        return (
            obj.event.safe_translation_getter("title", any_language=True)
            or obj.event.slug
        )


class EventCheckinSerializer(serializers.ModelSerializer):
    """Serializer for event check-ins."""

    class Meta:
        model = EventCheckin
        fields = ["id", "event", "checked_in_at", "points_awarded"]
        read_only_fields = fields
