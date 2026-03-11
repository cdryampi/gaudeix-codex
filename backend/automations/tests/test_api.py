from __future__ import annotations

import pytest
from django.urls import reverse
from rest_framework import status

from automations.models import AutomationJob, AutomationRun
from site_settings.models_weather import MunicipalityWeather


pytestmark = pytest.mark.django_db


def _today_weather():
    return {
        "datetime": "2026-06-20",
        "tempmax": 24,
        "tempmin": 16,
        "precip_prob": 10,
        "weather_code": 1,
    }


def test_admin_can_list_templates(admin_client):
    response = admin_client.get(reverse("automation-template-list"))

    assert response.status_code == status.HTTP_200_OK
    slugs = {template["slug"] for template in response.data}
    assert "weather.refresh_municipality_forecast" in slugs
    assert "beach_safety.evaluate_red_flag_proposal" in slugs
    weather_template = next(
        template
        for template in response.data
        if template["slug"] == "weather.refresh_municipality_forecast"
    )
    assert weather_template["editor_flow"]["node_order"] == ["trigger", "action"]
    assert weather_template["editor_flow"]["nodes"][0]["editable_fields"] == [
        "status",
        "interval_hours",
    ]
    beach_template = next(
        template
        for template in response.data
        if template["slug"] == "beach_safety.evaluate_red_flag_proposal"
    )
    assert beach_template["editor_flow"]["node_order"] == [
        "trigger",
        "condition",
        "action",
    ]
    assert beach_template["editor_flow"]["nodes"][2]["editable_fields"] == [
        "config.refresh_weather_before_run",
    ]
    assert {
        branch["id"] for branch in beach_template["editor_flow"]["result_branches"]
    } == {"result_proposal", "result_skipped", "result_error"}


def test_admin_can_create_and_patch_automation(admin_client):
    create_response = admin_client.post(
        reverse("automation-list"),
        {
            "template_slug": "weather.refresh_municipality_forecast",
            "name": "Weather Refresh",
            "interval_hours": 6,
            "config": {},
        },
        format="json",
    )

    assert create_response.status_code == status.HTTP_201_CREATED
    automation_id = create_response.data["id"]

    patch_response = admin_client.patch(
        reverse("automation-detail", kwargs={"pk": automation_id}),
        {"status": "paused"},
        format="json",
    )

    assert patch_response.status_code == status.HTTP_200_OK
    assert patch_response.data["status"] == "paused"


def test_admin_create_same_template_updates_existing_job(admin_client):
    first_response = admin_client.post(
        reverse("automation-list"),
        {
            "template_slug": "weather.refresh_municipality_forecast",
            "name": "Weather Refresh",
            "interval_hours": 3,
            "config": {},
        },
        format="json",
    )

    second_response = admin_client.post(
        reverse("automation-list"),
        {
            "template_slug": "weather.refresh_municipality_forecast",
            "name": "Weather Refresh Updated",
            "interval_hours": 6,
            "config": {},
        },
        format="json",
    )

    assert first_response.status_code == status.HTTP_201_CREATED
    assert second_response.status_code == status.HTTP_201_CREATED
    assert first_response.data["id"] == second_response.data["id"]
    assert (
        AutomationJob.objects.filter(
            template_slug="weather.refresh_municipality_forecast"
        ).count()
        == 1
    )


def test_admin_can_run_job_now_and_list_runs(admin_client, monkeypatch):
    job = AutomationJob.objects.create(
        template_slug="weather.refresh_municipality_forecast",
        name="Weather Refresh",
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

    run_response = admin_client.post(
        reverse("automation-run-now", kwargs={"pk": job.pk})
    )

    assert run_response.status_code == status.HTTP_202_ACCEPTED
    assert AutomationRun.objects.filter(automation=job).count() == 1

    history_response = admin_client.get(reverse("automation-runs", kwargs={"pk": job.pk}))
    assert history_response.status_code == status.HTTP_200_OK
    assert len(history_response.data) == 1
    assert history_response.data[0]["step_results"][0]["node_id"] == "trigger"
    assert history_response.data[0]["payload_snapshot"]["source"] == "test"
    assert history_response.data[0]["step_results"][-1]["node_id"] == "result_error"


def test_non_admin_cannot_manage_automations(auth_client):
    response = auth_client.get(reverse("automation-list"))

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_admin_can_list_jobs_with_latest_run_payload(admin_client, monkeypatch):
    job = AutomationJob.objects.create(
        template_slug="weather.refresh_municipality_forecast",
        name="Weather Refresh",
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

    monkeypatch.setattr(
        "automations.registry.WeatherService.update_forecast", fake_update_forecast
    )
    admin_client.post(reverse("automation-run-now", kwargs={"pk": job.pk}))

    response = admin_client.get(reverse("automation-list"))

    assert response.status_code == status.HTTP_200_OK
    listed_job = next(item for item in response.data if item["id"] == job.id)
    assert listed_job["latest_run"]["status"] == "succeeded"
    assert listed_job["latest_run"]["payload_snapshot"]["source"] == "test"
    assert listed_job["latest_run"]["step_results"][1]["node_kind"] == "action"
