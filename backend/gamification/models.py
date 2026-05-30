"""Models for gamification points, transactions, and check-ins."""

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserPoints(models.Model):
    """Aggregate points and level for a user."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="points",
    )
    total_points = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    events_completed = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "User Points"
        verbose_name_plural = "User Points"

    def __str__(self) -> str:
        return f"{self.user} - {self.total_points} points"


class PointTransaction(models.Model):
    """Historical transactions for user points."""

    class TransactionType(models.TextChoices):
        EVENT_ATTENDANCE = "event_attendance", _("Asistencia a evento")
        EVENT_CHECKIN = "event_checkin", _("Check-in en evento")
        REGISTRATION_BONUS = "registration", _("Bonus de registro")
        REFERRAL = "referral", _("Referido")
        MANUAL = "manual", _("Ajuste manual")

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="point_transactions",
    )
    points = models.IntegerField()
    transaction_type = models.CharField(max_length=50, choices=TransactionType.choices)
    event = models.ForeignKey(
        "events.Event",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="point_transactions",
    )
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at", "-id")

    def __str__(self) -> str:
        return f"{self.user} {self.points} ({self.transaction_type})"


class EventCheckin(models.Model):
    """Record of user attendance check-ins for events."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event = models.ForeignKey("events.Event", on_delete=models.CASCADE)
    event_date = models.ForeignKey(
        "events.EventDate",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text=_("Specific session the user attended"),
    )
    checked_in_at = models.DateTimeField(auto_now_add=True)
    points_awarded = models.PositiveIntegerField()

    class Meta:
        unique_together = ["user", "event"]
        ordering = ("-checked_in_at", "-id")

    def __str__(self) -> str:
        if self.event_date_id:
            return f"{self.user} checked in {self.event} on {self.event_date.start_at}"
        return f"{self.user} checked in {self.event}"
