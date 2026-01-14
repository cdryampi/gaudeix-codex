"""Models for device tokens and notifications."""

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class DeviceToken(models.Model):
    """Tokens de dispositivos para push notifications."""

    class Platform(models.TextChoices):
        IOS = "ios", "iOS"
        ANDROID = "android", "Android"
        WEB = "web", "Web"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="devices",
    )
    token = models.CharField(max_length=500, unique=True)
    platform = models.CharField(max_length=10, choices=Platform.choices)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-last_used", "-id")

    def __str__(self) -> str:
        return f"{self.user} ({self.platform})"


class Notification(models.Model):
    """Notificaciones enviadas/pendientes."""

    class NotificationType(models.TextChoices):
        EVENT_REMINDER = "event_reminder", _("Recordatorio de evento")
        EVENT_CHANGE = "event_change", _("Cambio en evento")
        POINTS_EARNED = "points_earned", _("Puntos ganados")
        MUNICIPAL_ALERT = "municipal_alert", _("Aviso municipal")
        GENERAL = "general", _("General")

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )
    title = models.CharField(max_length=100)
    body = models.TextField()
    notification_type = models.CharField(
        max_length=50, choices=NotificationType.choices
    )
    data = models.JSONField(default=dict)
    read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at", "-id")

    def __str__(self) -> str:
        return f"{self.notification_type}: {self.title}"
