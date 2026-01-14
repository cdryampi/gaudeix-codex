"""ViewSets for device registration and notifications."""

from django.contrib.auth import get_user_model
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import DeviceToken, Notification
from .serializers import DeviceTokenSerializer, NotificationSerializer
from .utils import send_broadcast_notification, send_push_notification

User = get_user_model()


class DeviceTokenViewSet(viewsets.ModelViewSet):
    """Register and manage device tokens."""

    serializer_class = DeviceTokenSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "token"
    queryset = DeviceToken.objects.all()

    def get_queryset(self):
        return DeviceToken.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        token = serializer.validated_data["token"]
        platform = serializer.validated_data["platform"]
        is_active = serializer.validated_data.get("is_active", True)

        device, _ = DeviceToken.objects.update_or_create(
            token=token,
            defaults={
                "user": self.request.user,
                "platform": platform,
                "is_active": is_active,
            },
        )
        serializer.instance = device


class NotificationViewSet(viewsets.ModelViewSet):
    """List and update notifications for the authenticated user."""

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    queryset = Notification.objects.all()

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        title = serializer.validated_data["title"]
        body = serializer.validated_data["body"]
        notification_type = serializer.validated_data["notification_type"]
        data = serializer.validated_data.get("data", {})
        user_id = request.data.get("user_id")

        if user_id:
            try:
                user_id = int(user_id)
            except (TypeError, ValueError):
                return Response(
                    {"detail": "Invalid user_id."}, status=status.HTTP_400_BAD_REQUEST
                )
            user = User.objects.filter(pk=user_id).first()
            if not user:
                return Response(
                    {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
                )
            notification = send_push_notification(
                user=user,
                title=title,
                body=body,
                notification_type=notification_type,
                data=data,
            )
        else:
            notification = send_broadcast_notification(
                title=title,
                body=body,
                notification_type=notification_type,
                data=data,
            )

        output = self.get_serializer(notification)
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, read=False).count()
        return Response({"unread": count}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="read")
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save(update_fields=["read"])
        return Response(
            self.get_serializer(notification).data, status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response(status=status.HTTP_204_NO_CONTENT)
