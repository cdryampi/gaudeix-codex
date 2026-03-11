from __future__ import annotations

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from core.models import BaseModel


class AutomationJob(BaseModel):
    class Status(models.TextChoices):
        ACTIVE = "active", _("Active")
        PAUSED = "paused", _("Paused")

    class RunStatus(models.TextChoices):
        PENDING = "pending", _("Pending")
        RUNNING = "running", _("Running")
        SUCCEEDED = "succeeded", _("Succeeded")
        FAILED = "failed", _("Failed")
        SKIPPED = "skipped", _("Skipped")

    template_slug = models.CharField(max_length=120)
    name = models.CharField(max_length=200)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    interval_hours = models.PositiveSmallIntegerField(default=3)
    season_start_month = models.PositiveSmallIntegerField(null=True, blank=True)
    season_end_month = models.PositiveSmallIntegerField(null=True, blank=True)
    config = models.JSONField(default=dict, blank=True)
    last_run_at = models.DateTimeField(null=True, blank=True)
    next_run_at = models.DateTimeField(null=True, blank=True)
    last_run_status = models.CharField(
        max_length=20,
        choices=RunStatus.choices,
        blank=True,
        default="",
    )

    class Meta:
        ordering = ("name", "id")
        verbose_name = _("Automation Job")
        verbose_name_plural = _("Automation Jobs")

    def __str__(self) -> str:
        return f"{self.name} ({self.template_slug})"


class AutomationRun(BaseModel):
    class Trigger(models.TextChoices):
        SCHEDULE = "schedule", _("Schedule")
        MANUAL = "manual", _("Manual")
        RETRY = "retry", _("Retry")

    class Status(models.TextChoices):
        PENDING = "pending", _("Pending")
        RUNNING = "running", _("Running")
        SUCCEEDED = "succeeded", _("Succeeded")
        FAILED = "failed", _("Failed")
        SKIPPED = "skipped", _("Skipped")

    automation = models.ForeignKey(
        AutomationJob,
        on_delete=models.CASCADE,
        related_name="runs",
    )
    trigger = models.CharField(max_length=20, choices=Trigger.choices)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    started_at = models.DateTimeField(default=timezone.now)
    finished_at = models.DateTimeField(null=True, blank=True)
    summary = models.TextField(blank=True, default="")
    error_message = models.TextField(blank=True, default="")
    payload_snapshot = models.JSONField(default=dict, blank=True)
    window_key = models.CharField(max_length=120, null=True, blank=True)

    class Meta:
        ordering = ("-started_at", "-id")
        constraints = [
            models.UniqueConstraint(
                fields=["automation", "window_key"],
                condition=models.Q(window_key__isnull=False),
                name="unique_automation_run_window_per_job",
            )
        ]
        verbose_name = _("Automation Run")
        verbose_name_plural = _("Automation Runs")

    def __str__(self) -> str:
        return f"{self.automation.name} run #{self.pk} ({self.status})"
