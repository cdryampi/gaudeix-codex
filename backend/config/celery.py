from __future__ import annotations

import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("gaudeix_backend")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "automations-dispatch-due-jobs": {
        "task": "automations.tasks.dispatch_due_automations",
        "schedule": crontab(minute="*/5"),
    }
}
