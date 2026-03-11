from __future__ import annotations

import pytest
from django.utils import timezone

from automations.models import AutomationJob, AutomationRun
from automations.registry import AutomationExecutionResult
from beach_safety.models import BeachSafetyProposal, BeachSafetyStatus
from beach_safety.services import (
    approve_proposal,
    evaluate_weather_day,
    execute_beach_safety_check,
    reject_proposal,
)
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


def test_evaluate_weather_day_returns_green_for_stable_conditions():
    result = evaluate_weather_day(_today_weather())

    assert result.recommended_status == BeachSafetyStatus.SafetyStatus.GREEN
    assert result.reasons


def test_evaluate_weather_day_returns_red_for_severe_storm():
    result = evaluate_weather_day(_today_weather(weather_code=95, precip_prob=90))

    assert result.recommended_status == BeachSafetyStatus.SafetyStatus.RED
    assert any("tormenta" in reason.lower() for reason in result.reasons)


def test_execute_beach_safety_check_creates_proposal_for_run():
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
    )
    run = AutomationRun.objects.create(
        automation=job,
        trigger=AutomationRun.Trigger.MANUAL,
        status=AutomationRun.Status.RUNNING,
    )

    result = execute_beach_safety_check(run=run)

    assert result.status == AutomationRun.Status.SUCCEEDED
    assert BeachSafetyProposal.objects.count() == 1
    proposal = BeachSafetyProposal.objects.get()
    assert proposal.recommended_status == BeachSafetyStatus.SafetyStatus.RED
    assert proposal.review_status == BeachSafetyProposal.ReviewStatus.PENDING


def test_execute_beach_safety_check_skips_when_status_already_matches():
    MunicipalityWeather.objects.create(
        forecast_data={
            "address": "Cabrera de Mar",
            "source": "test",
            "days": [_today_weather(weather_code=1, precip_prob=10)],
        }
    )
    job = AutomationJob.objects.create(
        template_slug="beach_safety.evaluate_red_flag_proposal",
        name="Playas",
        interval_hours=3,
    )
    run = AutomationRun.objects.create(
        automation=job,
        trigger=AutomationRun.Trigger.MANUAL,
        status=AutomationRun.Status.RUNNING,
    )

    result = execute_beach_safety_check(run=run)

    assert result.status == AutomationRun.Status.SKIPPED
    assert BeachSafetyProposal.objects.count() == 0


def test_execute_beach_safety_check_fails_without_weather_snapshot(monkeypatch):
    job = AutomationJob.objects.create(
        template_slug="beach_safety.evaluate_red_flag_proposal",
        name="Playas",
        interval_hours=3,
    )
    run = AutomationRun.objects.create(
        automation=job,
        trigger=AutomationRun.Trigger.MANUAL,
        status=AutomationRun.Status.RUNNING,
    )
    monkeypatch.setattr("beach_safety.services.WeatherService.update_forecast", lambda: None)

    result = execute_beach_safety_check(run=run)

    assert result.status == AutomationRun.Status.FAILED
    assert "Weather data" in result.error_message


def test_approve_proposal_updates_published_status(admin_user):
    proposal = BeachSafetyProposal.objects.create(
        recommended_status=BeachSafetyStatus.SafetyStatus.RED,
        reasons=["Tormenta"],
        recommendation_window_start=timezone.now(),
        recommendation_window_end=timezone.now(),
    )

    approved = approve_proposal(
        proposal,
        reviewer=admin_user,
        review_notes="Confirmado por el equipo municipal.",
    )

    status_obj = BeachSafetyStatus.get_solo()
    assert approved.review_status == BeachSafetyProposal.ReviewStatus.APPROVED
    assert status_obj.published_status == BeachSafetyStatus.SafetyStatus.RED
    assert status_obj.published_by == admin_user


def test_reject_proposal_keeps_published_status_green(admin_user):
    proposal = BeachSafetyProposal.objects.create(
        recommended_status=BeachSafetyStatus.SafetyStatus.YELLOW,
        reasons=["Chubascos"],
        recommendation_window_start=timezone.now(),
        recommendation_window_end=timezone.now(),
    )

    rejected = reject_proposal(
        proposal,
        reviewer=admin_user,
        review_notes="No procede cambiar el estado.",
    )

    status_obj = BeachSafetyStatus.get_solo()
    assert rejected.review_status == BeachSafetyProposal.ReviewStatus.REJECTED
    assert status_obj.published_status == BeachSafetyStatus.SafetyStatus.GREEN
