from __future__ import annotations

from datetime import datetime, timedelta

import pytest
from django.core.management import call_command
from django.utils import timezone

from automations.models import AutomationJob, AutomationRun
from automations.services import (
    calculate_next_run_at,
    create_or_update_job,
    dispatch_due_automations,
    execute_job,
)
from beach_safety.models import BeachSafetyProposal
from site_settings.models_weather import MunicipalityWeather


pytestmark = pytest.mark.django_db


def _today_weather(**overrides):
    return {
        "datetime": timezone.localdate().strftime("%Y-%m-%d"),
        "tempmax": 24,
        "tempmin": 16,
        "precip_prob": 10,
        "weather_code": 1,
        **overrides,
    }


def test_calculate_next_run_at_respects_pause_and_interval():
    job = AutomationJob(
        template_slug="weather.refresh_municipality_forecast",
        name="Weather",
        status=AutomationJob.Status.ACTIVE,
        interval_hours=4,
    )

    base_time = timezone.make_aware(datetime(2026, 6, 20, 9, 0, 0))
    next_run_at = calculate_next_run_at(job, base_time=base_time)
    assert next_run_at == timezone.make_aware(datetime(2026, 6, 20, 13, 0, 0))

    job.status = AutomationJob.Status.PAUSED
    assert calculate_next_run_at(job, base_time=base_time) is None


def test_execute_weather_refresh_job_updates_run(monkeypatch):
    job = AutomationJob.objects.create(
        template_slug="weather.refresh_municipality_forecast",
        name="Weather",
        interval_hours=3,
    )

    def fake_update_forecast():
        return MunicipalityWeather.objects.create(
            forecast_data={
                "address": "Cabrera de Mar",
                "source": "test",
                "days": [_today_weather()],
            }
        )

    monkeypatch.setattr("automations.registry.WeatherService.update_forecast", fake_update_forecast)

    run = execute_job(job, trigger=AutomationRun.Trigger.MANUAL)

    assert run.status == AutomationRun.Status.SUCCEEDED
    assert run.payload_snapshot["source"] == "test"
    assert run.payload_snapshot["step_results"][1]["node_id"] == "action"
    job.refresh_from_db()
    assert job.last_run_status == AutomationJob.RunStatus.SUCCEEDED


def test_beach_safety_job_is_idempotent_per_window_key():
    MunicipalityWeather.objects.create(
        forecast_data={
            "address": "Cabrera de Mar",
            "source": "test",
            "days": [_today_weather(weather_code=95, precip_prob=80)],
        }
    )
    job = AutomationJob.objects.create(
        template_slug="beach_safety.evaluate_red_flag_proposal",
        name="Playas",
        interval_hours=3,
        season_start_month=6,
        season_end_month=9,
        config={"refresh_weather_before_run": False},
    )

    first_run = execute_job(job, trigger=AutomationRun.Trigger.SCHEDULE, window_key="window-1")
    second_run = execute_job(job, trigger=AutomationRun.Trigger.SCHEDULE, window_key="window-1")

    assert first_run.pk == second_run.pk
    assert AutomationRun.objects.count() == 1
    assert BeachSafetyProposal.objects.count() == 1
    assert first_run.payload_snapshot["step_results"][-3]["node_id"] == "result_proposal"


def test_dispatch_due_automations_queues_due_jobs(monkeypatch):
    job = AutomationJob.objects.create(
        template_slug="weather.refresh_municipality_forecast",
        name="Weather",
        interval_hours=3,
        next_run_at=timezone.now() - timedelta(minutes=1),
    )
    queued = []

    class FakeTask:
        def delay(self, job_id, *, trigger, window_key=None):
            queued.append((job_id, trigger, window_key))
            return None

    monkeypatch.setattr("automations.tasks.execute_automation_job", FakeTask())

    queued_ids = dispatch_due_automations()

    assert queued_ids == [job.id]
    assert queued[0][0] == job.id
    job.refresh_from_db()
    assert job.next_run_at is not None


def test_create_or_update_job_reuses_existing_template_job():
    first_job = create_or_update_job(
        template_slug="weather.refresh_municipality_forecast",
        name="Weather Refresh",
        status=AutomationJob.Status.ACTIVE,
        interval_hours=3,
        season_start_month=None,
        season_end_month=None,
        config={},
    )

    second_job = create_or_update_job(
        template_slug="weather.refresh_municipality_forecast",
        name="Weather Refresh Updated",
        status=AutomationJob.Status.PAUSED,
        interval_hours=6,
        season_start_month=None,
        season_end_month=None,
        config={},
    )

    assert first_job.pk == second_job.pk
    assert AutomationJob.objects.filter(
        template_slug="weather.refresh_municipality_forecast"
    ).count() == 1
    second_job.refresh_from_db()
    assert second_job.name == "Weather Refresh Updated"
    assert second_job.status == AutomationJob.Status.PAUSED


def test_create_or_update_job_normalizes_beach_safety_config():
    job = create_or_update_job(
        template_slug="beach_safety.evaluate_red_flag_proposal",
        name="Playas",
        status=AutomationJob.Status.ACTIVE,
        interval_hours=3,
        season_start_month=6,
        season_end_month=9,
        config={},
    )

    assert job.config == {"refresh_weather_before_run": True}


def test_bootstrap_automations_is_idempotent():
    call_command("bootstrap_automations", verbosity=0)
    call_command("bootstrap_automations", verbosity=0)

    assert (
        AutomationJob.objects.filter(
            template_slug="weather.refresh_municipality_forecast"
        ).count()
        == 1
    )
    assert (
        AutomationJob.objects.filter(
            template_slug="beach_safety.evaluate_red_flag_proposal"
        ).count()
        == 1
    )
    beach_job = AutomationJob.objects.get(
        template_slug="beach_safety.evaluate_red_flag_proposal"
    )
    assert beach_job.config == {"refresh_weather_before_run": True}
