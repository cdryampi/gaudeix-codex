from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from solo.models import SingletonModel

from automations.models import AutomationRun
from core.models import BaseModel


class BeachSafetyStatus(SingletonModel, BaseModel):
    class SafetyStatus(models.TextChoices):
        GREEN = "green", _("Green")
        YELLOW = "yellow", _("Yellow")
        RED = "red", _("Red")

    published_status = models.CharField(
        max_length=20,
        choices=SafetyStatus.choices,
        default=SafetyStatus.GREEN,
        verbose_name=_("Published status"),
    )
    published_notes = models.TextField(blank=True, default="")
    published_at = models.DateTimeField(null=True, blank=True)
    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="published_beach_safety_statuses",
    )

    class Meta:
        verbose_name = _("Beach Safety Status")
        verbose_name_plural = _("Beach Safety Status")

    def __str__(self) -> str:
        return f"Beach Safety Status ({self.published_status})"


class BeachSafetyProposal(BaseModel):
    class ReviewStatus(models.TextChoices):
        PENDING = "pending", _("Pending")
        APPROVED = "approved", _("Approved")
        REJECTED = "rejected", _("Rejected")

    recommended_status = models.CharField(
        max_length=20,
        choices=BeachSafetyStatus.SafetyStatus.choices,
    )
    review_status = models.CharField(
        max_length=20,
        choices=ReviewStatus.choices,
        default=ReviewStatus.PENDING,
    )
    reasons = models.JSONField(default=list, blank=True)
    weather_snapshot = models.JSONField(default=dict, blank=True)
    weather_source_updated_at = models.DateTimeField(null=True, blank=True)
    recommendation_window_start = models.DateTimeField()
    recommendation_window_end = models.DateTimeField()
    proposed_at = models.DateTimeField(default=timezone.now)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_beach_safety_proposals",
    )
    review_notes = models.TextField(blank=True, default="")
    source_run = models.ForeignKey(
        AutomationRun,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="proposals",
    )

    class Meta:
        ordering = ("-proposed_at", "-id")
        constraints = [
            models.UniqueConstraint(
                fields=["recommendation_window_start", "recommendation_window_end"],
                name="unique_beach_safety_proposal_window",
            )
        ]
        verbose_name = _("Beach Safety Proposal")
        verbose_name_plural = _("Beach Safety Proposals")

    def __str__(self) -> str:
        return f"Proposal #{self.pk} ({self.recommended_status}, {self.review_status})"
