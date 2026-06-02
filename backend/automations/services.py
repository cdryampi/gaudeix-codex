from __future__ import annotations

from datetime import datetime, timedelta

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.utils import timezone

from .models import AutomationJob, AutomationRun
from .registry import AutomationExecutionResult, get_template_definition, list_template_definitions


DISPATCH_BATCH_SIZE = 20


def validate_schedule_fields(
    *,
    template_slug: str,
    interval_hours: int,
    season_start_month: int | None,
    season_end_month: int | None,
    config: dict | None,
) -> dict:
    if interval_hours < 1 or interval_hours > 24:
        raise ValidationError({"interval_hours": "Interval must be between 1 and 24 hours."})

    definition = get_template_definition(template_slug)

    if (season_start_month is None) != (season_end_month is None):
        raise ValidationError(
            {
                "season_start_month": "Provide both season months or neither.",
                "season_end_month": "Provide both season months or neither.",
            }
        )

    if not definition.supports_season_window and (
        season_start_month is not None or season_end_month is not None
    ):
        raise ValidationError(
            {
                "season_start_month": "This automation does not support a seasonal window.",
                "season_end_month": "This automation does not support a seasonal window.",
            }
        )

    for field_name, month_value in (
        ("season_start_month", season_start_month),
        ("season_end_month", season_end_month),
    ):
        if month_value is None:
            continue
        if month_value < 1 or month_value > 12:
            raise ValidationError({field_name: "Month must be between 1 and 12."})

    normalized_config = definition.validate_config(config or {}) if definition.validate_config else dict(config or {})
    return normalized_config


def serialize_template_definitions() -> list[dict]:
    return [definition.serialize() for definition in list_template_definitions()]


def is_job_in_season(job: AutomationJob, at: datetime | None = None) -> bool:
    if job.season_start_month is None or job.season_end_month is None:
        return True

    month = (at or timezone.now()).month
    start = job.season_start_month
    end = job.season_end_month

    if start <= end:
        return start <= month <= end
    return month >= start or month <= end


def _month_start(dt: datetime) -> datetime:
    return dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def _add_months(dt: datetime, months: int) -> datetime:
    month_index = dt.month - 1 + months
    year = dt.year + month_index // 12
    month = month_index % 12 + 1
    return dt.replace(year=year, month=month, day=1)


def get_next_season_start(job: AutomationJob, reference: datetime | None = None) -> datetime:
    if job.season_start_month is None or job.season_end_month is None:
        return reference or timezone.now()

    reference = _month_start(reference or timezone.now())
    for offset in range(0, 24):
        candidate = _add_months(reference, offset)
        if candidate.month == job.season_start_month and candidate >= reference:
            return candidate
    return reference


def calculate_next_run_at(
    job: AutomationJob,
    *,
    base_time: datetime | None = None,
    immediate: bool = False,
) -> datetime | None:
    if job.status == AutomationJob.Status.PAUSED:
        return None

    reference = base_time or timezone.now()
    candidate = reference if immediate else reference + timedelta(hours=job.interval_hours)

    if is_job_in_season(job, at=candidate):
        return candidate

    return get_next_season_start(job, reference=candidate)


def sync_job_schedule(job: AutomationJob, *, immediate: bool = False) -> AutomationJob:
    job.next_run_at = calculate_next_run_at(job, base_time=timezone.now(), immediate=immediate)
    return job


def create_or_update_job(
    *,
    job: AutomationJob | None = None,
    template_slug: str,
    name: str,
    status: str,
    interval_hours: int,
    season_start_month: int | None,
    season_end_month: int | None,
    config: dict | None,
) -> AutomationJob:
    normalized_config = validate_schedule_fields(
        template_slug=template_slug,
        interval_hours=interval_hours,
        season_start_month=season_start_month,
        season_end_month=season_end_month,
        config=config,
    )

    job = job or get_default_job_for_template(template_slug) or AutomationJob(
        template_slug=template_slug
    )
    job.template_slug = template_slug
    job.name = name
    job.status = status
    job.interval_hours = interval_hours
    job.season_start_month = season_start_month
    job.season_end_month = season_end_month
    job.config = normalized_config
    sync_job_schedule(job, immediate=(status == AutomationJob.Status.ACTIVE))
    job.save()
    return job


def dispatch_due_automations(*, now: datetime | None = None) -> list[int]:
    from .tasks import execute_automation_job

    now = now or timezone.now()
    due_ids = list(
        AutomationJob.objects.filter(
            status=AutomationJob.Status.ACTIVE,
            next_run_at__isnull=False,
            next_run_at__lte=now,
        )
        .order_by("next_run_at", "id")
        .values_list("id", flat=True)[:DISPATCH_BATCH_SIZE]
    )

    queued_job_ids: list[int] = []

    for job_id in due_ids:
        scheduled_for: datetime | None = None
        window_key: str | None = None
        with transaction.atomic():
            job = (
                AutomationJob.objects.select_for_update(skip_locked=True)
                .filter(
                    id=job_id,
                    status=AutomationJob.Status.ACTIVE,
                    next_run_at__isnull=False,
                    next_run_at__lte=now,
                )
                .first()
            )
            if job is None:
                continue

            scheduled_for = job.next_run_at or now
            window_key = scheduled_for.isoformat()
            job.next_run_at = calculate_next_run_at(job, base_time=scheduled_for)
            job.save(update_fields=["next_run_at", "fecha_modificacion"])

        execute_automation_job.delay(
            job_id,
            trigger=AutomationRun.Trigger.SCHEDULE,
            window_key=window_key,
        )
        queued_job_ids.append(job_id)

    return queued_job_ids


def _create_or_get_run(
    job: AutomationJob,
    *,
    trigger: str,
    window_key: str | None,
) -> AutomationRun:
    if not window_key:
        return AutomationRun.objects.create(
            automation=job,
            trigger=trigger,
            status=AutomationRun.Status.PENDING,
        )

    try:
        with transaction.atomic():
            run, created = AutomationRun.objects.get_or_create(
                automation=job,
                window_key=window_key,
                defaults={
                    "trigger": trigger,
                    "status": AutomationRun.Status.PENDING,
                },
            )
            if not created:
                return run
            return run
    except IntegrityError:
        return AutomationRun.objects.get(automation=job, window_key=window_key)


def finalize_run(
    run: AutomationRun,
    result: AutomationExecutionResult,
    *,
    finished_at: datetime | None = None,
) -> AutomationRun:
    finished_at = finished_at or timezone.now()
    run.status = result.status
    run.summary = result.summary
    run.error_message = result.error_message
    run.payload_snapshot = result.payload_snapshot
    run.finished_at = finished_at
    run.save(
        update_fields=[
            "status",
            "summary",
            "error_message",
            "payload_snapshot",
            "finished_at",
            "fecha_modificacion",
        ]
    )

    job = run.automation
    job.last_run_at = finished_at
    job.last_run_status = result.status
    job.save(update_fields=["last_run_at", "last_run_status", "fecha_modificacion"])
    return run


def execute_job(
    job: AutomationJob,
    *,
    trigger: str,
    window_key: str | None = None,
) -> AutomationRun:
    definition = get_template_definition(job.template_slug)
    run = _create_or_get_run(job, trigger=trigger, window_key=window_key)

    if window_key and run.status != AutomationRun.Status.PENDING:
        return run

    run.status = AutomationRun.Status.RUNNING
    run.trigger = trigger
    run.save(update_fields=["status", "trigger", "fecha_modificacion"])

    try:
        result = definition.execute(job, run, trigger) if definition.execute else AutomationExecutionResult(
            status=AutomationRun.Status.SKIPPED,
            summary="No execution handler configured.",
        )
    except ValidationError as exc:
        result = AutomationExecutionResult(
            status=AutomationRun.Status.FAILED,
            error_message=str(exc),
        )
    except Exception as exc:  # noqa: BLE001 - keep task failures explicit in run history
        result = AutomationExecutionResult(
            status=AutomationRun.Status.FAILED,
            error_message=str(exc),
        )

    return finalize_run(run, result)


def run_automation_now(job: AutomationJob):
    from .tasks import execute_automation_job

    return execute_automation_job.delay(job.id, trigger=AutomationRun.Trigger.MANUAL)


def get_default_job_for_template(template_slug: str) -> AutomationJob | None:
    return (
        AutomationJob.objects.filter(template_slug=template_slug)
        .order_by("id")
        .first()
    )


def bootstrap_default_automations() -> list[AutomationJob]:
    defaults = [
        {
            "template_slug": "weather.refresh_municipality_forecast",
            "name": "Refresco meteo municipal",
            "status": AutomationJob.Status.ACTIVE,
            "interval_hours": 3,
            "season_start_month": None,
            "season_end_month": None,
            "config": {},
        },
        {
            "template_slug": "beach_safety.evaluate_red_flag_proposal",
            "name": "Evaluacion seguridad playas",
            "status": AutomationJob.Status.ACTIVE,
            "interval_hours": 3,
            "season_start_month": 6,
            "season_end_month": 9,
            "config": {"refresh_weather_before_run": True},
        },
    ]
    jobs: list[AutomationJob] = []
    for payload in defaults:
        job = AutomationJob.objects.filter(template_slug=payload["template_slug"]).first()
        jobs.append(
            create_or_update_job(
                job=job,
                template_slug=payload["template_slug"],
                name=payload["name"],
                status=payload["status"],
                interval_hours=payload["interval_hours"],
                season_start_month=payload["season_start_month"],
                season_end_month=payload["season_end_month"],
                config=payload["config"],
            )
        )
    return jobs
