from __future__ import annotations

from celery import shared_task

from .models import AutomationJob
from .services import dispatch_due_automations, execute_job


@shared_task(name="automations.tasks.dispatch_due_automations")
def dispatch_due_automations_task():
    return dispatch_due_automations()


@shared_task(name="automations.tasks.execute_automation_job")
def execute_automation_job(job_id: int, *, trigger: str, window_key: str | None = None):
    job = AutomationJob.objects.get(pk=job_id)
    run = execute_job(job, trigger=trigger, window_key=window_key)
    return run.pk
