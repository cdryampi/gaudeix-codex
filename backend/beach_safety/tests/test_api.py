from __future__ import annotations

from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from automations.models import AutomationJob, AutomationRun
from beach_safety.models import BeachSafetyProposal, BeachSafetyStatus
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


def _beach_safety_job():
    return AutomationJob.objects.create(
        template_slug="beach_safety.evaluate_red_flag_proposal",
        name="Playas",
        interval_hours=3,
        next_run_at=timezone.now(),
    )


def test_public_can_read_current_beach_safety_status(api_client):
    BeachSafetyStatus.get_solo()

    response = api_client.get(reverse("beach-safety-status-current"))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["published_status"] == BeachSafetyStatus.SafetyStatus.GREEN


def test_admin_can_trigger_manual_check(admin_client):
    _beach_safety_job()
    MunicipalityWeather.objects.create(
        forecast_data={
            "address": "Cabrera de Mar",
            "source": "test",
            "days": [_today_weather(weather_code=95, precip_prob=80)],
        }
    )

    response = admin_client.post(reverse("beach-safety-status-run-check"))

    assert response.status_code == status.HTTP_202_ACCEPTED
    assert "task_id" in response.data
    assert BeachSafetyProposal.objects.count() == 1
    proposal = BeachSafetyProposal.objects.get()
    assert proposal.source_run is not None


def test_non_admin_cannot_trigger_manual_check(auth_client):
    response = auth_client.post(reverse("beach-safety-status-run-check"))

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_admin_can_approve_pending_proposal(admin_client, admin_user):
    job = _beach_safety_job()
    run = AutomationRun.objects.create(
        automation=job,
        trigger=AutomationRun.Trigger.MANUAL,
        status=AutomationRun.Status.SUCCEEDED,
    )
    proposal = BeachSafetyProposal.objects.create(
        recommended_status=BeachSafetyStatus.SafetyStatus.RED,
        reasons=["Tormenta"],
        recommendation_window_start=timezone.now(),
        recommendation_window_end=timezone.now() + timedelta(hours=3),
        source_run=run,
    )

    response = admin_client.post(
        reverse("beach-safety-proposal-approve", kwargs={"pk": proposal.pk}),
        {"review_notes": "Confirmado por el equipo municipal."},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    proposal.refresh_from_db()
    status_obj = BeachSafetyStatus.get_solo()
    assert proposal.review_status == BeachSafetyProposal.ReviewStatus.APPROVED
    assert proposal.reviewed_by == admin_user
    assert status_obj.published_status == BeachSafetyStatus.SafetyStatus.RED


def test_admin_can_reject_pending_proposal(admin_client, admin_user):
    proposal = BeachSafetyProposal.objects.create(
        recommended_status=BeachSafetyStatus.SafetyStatus.YELLOW,
        reasons=["Chubascos"],
        recommendation_window_start=timezone.now(),
        recommendation_window_end=timezone.now() + timedelta(hours=3),
    )

    response = admin_client.post(
        reverse("beach-safety-proposal-reject", kwargs={"pk": proposal.pk}),
        {"review_notes": "Sin afectacion relevante."},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    proposal.refresh_from_db()
    assert proposal.review_status == BeachSafetyProposal.ReviewStatus.REJECTED
    assert proposal.reviewed_by == admin_user


def test_proposals_and_runs_are_admin_only(auth_client):
    proposal = BeachSafetyProposal.objects.create(
        recommended_status=BeachSafetyStatus.SafetyStatus.YELLOW,
        reasons=["Chubascos"],
        recommendation_window_start=timezone.now(),
        recommendation_window_end=timezone.now() + timedelta(hours=3),
    )
    run = AutomationRun.objects.create(
        automation=_beach_safety_job(),
        trigger=AutomationRun.Trigger.MANUAL,
        status=AutomationRun.Status.SUCCEEDED,
    )

    proposal_response = auth_client.get(reverse("beach-safety-proposal-list"))
    run_response = auth_client.get(reverse("beach-safety-run-list"))

    assert proposal_response.status_code == status.HTTP_403_FORBIDDEN
    assert run_response.status_code == status.HTTP_403_FORBIDDEN
    assert proposal.pk
    assert run.pk


def test_admin_can_list_proposals_and_runs(admin_client):
    job = _beach_safety_job()
    run = AutomationRun.objects.create(
        automation=job,
        trigger=AutomationRun.Trigger.MANUAL,
        status=AutomationRun.Status.SUCCEEDED,
        payload_snapshot={
            "step_results": [
                {
                    "node_id": "trigger",
                    "node_title": "Trigger horario",
                    "node_kind": "trigger",
                    "status": "completed",
                    "detail": "ok",
                },
                {
                    "node_id": "result_proposal",
                    "node_title": "Proposal created",
                    "node_kind": "result",
                    "status": "completed",
                    "detail": "proposal",
                },
            ]
        },
    )
    BeachSafetyProposal.objects.create(
        recommended_status=BeachSafetyStatus.SafetyStatus.RED,
        reasons=["Tormenta"],
        recommendation_window_start=timezone.now(),
        recommendation_window_end=timezone.now() + timedelta(hours=3),
        source_run=run,
    )

    proposal_response = admin_client.get(reverse("beach-safety-proposal-list"))
    run_response = admin_client.get(reverse("beach-safety-run-list"))

    assert proposal_response.status_code == status.HTTP_200_OK
    assert proposal_response.data[0]["recommended_status"] == "red"
    assert proposal_response.data[0]["source_run"] == run.id
    assert run_response.status_code == status.HTTP_200_OK
    assert run_response.data[0]["status"] == "succeeded"
    assert run_response.data[0]["weather_snapshot"]["step_results"][1]["node_id"] == (
        "result_proposal"
    )
