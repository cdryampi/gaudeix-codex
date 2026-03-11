from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta

from django.utils import timezone

from automations.models import AutomationRun
from automations.registry import (
    AutomationExecutionResult,
    _build_beach_safety_step_results,
)
from site_settings.models_weather import MunicipalityWeather
from site_settings.services import WeatherService

from .models import BeachSafetyProposal, BeachSafetyStatus


WINDOW_HOURS = 3
WEATHER_STALE_AFTER = timedelta(hours=3)
SEVERE_CODES = {95, 96, 99}
HEAVY_RAIN_CODES = {65, 66, 67, 82}
MODERATE_RAIN_CODES = {61, 63, 80, 81}
FOG_CODES = {45, 48}


@dataclass
class EvaluationResult:
    recommended_status: str
    reasons: list[str]


def get_window_bounds(now=None):
    now = now or timezone.now()
    window_start = now.replace(
        minute=0,
        second=0,
        microsecond=0,
        hour=(now.hour // WINDOW_HOURS) * WINDOW_HOURS,
    )
    window_end = window_start + timedelta(hours=WINDOW_HOURS)
    return window_start, window_end


def _serialize_weather_day(day: dict, weather) -> dict:
    return {
        "address": weather.forecast_data.get("address"),
        "source": weather.forecast_data.get("source"),
        "updated_at": weather.updated_at.isoformat() if weather.updated_at else None,
        "day": day,
    }


def get_latest_weather(refresh_if_stale: bool = True):
    weather = MunicipalityWeather.objects.order_by("-updated_at").first()
    now = timezone.now()
    if refresh_if_stale and (
        weather is None or now - weather.updated_at >= WEATHER_STALE_AFTER
    ):
        weather = WeatherService.update_forecast()
    return weather


def get_current_weather_day(weather: MunicipalityWeather | None) -> dict | None:
    if weather is None:
        return None

    today = timezone.localdate().strftime("%Y-%m-%d")
    for day in weather.forecast_data.get("days", []):
        if day.get("datetime") == today:
            return day

    days = weather.forecast_data.get("days", [])
    return days[0] if days else None


def evaluate_weather_day(day: dict | None) -> EvaluationResult:
    if not day:
        raise ValueError("No weather day available for beach safety evaluation.")

    precip_prob = int(day.get("precip_prob") or 0)
    weather_code = int(day.get("weather_code") or 0)
    reasons: list[str] = []

    if weather_code in SEVERE_CODES:
        reasons.append("Se detecta tormenta o fenomeno severo.")
    if weather_code in HEAVY_RAIN_CODES:
        reasons.append("El pronostico indica lluvia intensa.")
    if precip_prob >= 70:
        reasons.append("La probabilidad de precipitacion supera el 70%.")
    if weather_code in MODERATE_RAIN_CODES and precip_prob >= 40:
        reasons.append("Se esperan chubascos con riesgo moderado.")
    if weather_code in FOG_CODES:
        reasons.append("La visibilidad puede verse afectada por niebla.")

    if (
        weather_code in SEVERE_CODES
        or weather_code in HEAVY_RAIN_CODES
        or precip_prob >= 70
    ):
        return EvaluationResult(
            recommended_status=BeachSafetyStatus.SafetyStatus.RED,
            reasons=reasons or ["Se detecta un riesgo meteorologico alto."],
        )

    if (
        weather_code in MODERATE_RAIN_CODES
        or weather_code in FOG_CODES
        or precip_prob >= 40
    ):
        return EvaluationResult(
            recommended_status=BeachSafetyStatus.SafetyStatus.YELLOW,
            reasons=reasons or ["Se detecta un riesgo meteorologico moderado."],
        )

    return EvaluationResult(
        recommended_status=BeachSafetyStatus.SafetyStatus.GREEN,
        reasons=["No se detectan riesgos meteorologicos relevantes."],
    )


def execute_beach_safety_check(
    *,
    run: AutomationRun,
    refresh_weather_before_run: bool = True,
) -> AutomationExecutionResult:
    now = timezone.now()
    window_start, window_end = get_window_bounds(now=now)

    weather = get_latest_weather(refresh_if_stale=refresh_weather_before_run)
    if weather is None:
        return AutomationExecutionResult(
            status=AutomationRun.Status.FAILED,
            error_message="Weather data is unavailable after refresh.",
            payload_snapshot={
                "step_results": _build_beach_safety_step_results(
                    condition_positive=None,
                    action_status="failed",
                    result_node_id="result_error",
                    condition_detail="No hay datos meteorologicos disponibles para evaluar el riesgo.",
                    action_detail="No se ha podido iniciar la propuesta porque falta el parte meteorologico.",
                    result_detail="La ejecucion ha fallado por falta de datos meteorologicos.",
                )
            },
        )

    day = get_current_weather_day(weather)
    if not day:
        return AutomationExecutionResult(
            status=AutomationRun.Status.FAILED,
            error_message="No daily weather entry available for evaluation.",
            payload_snapshot={
                "step_results": _build_beach_safety_step_results(
                    condition_positive=None,
                    action_status="failed",
                    result_node_id="result_error",
                    condition_detail="El snapshot meteorologico no contiene un dia valido para evaluar.",
                    action_detail="No se ha podido generar la propuesta por falta de un parte diario usable.",
                    result_detail="La ejecucion ha fallado porque el pronostico no incluye un dia evaluable.",
                )
            },
        )

    weather_snapshot = _serialize_weather_day(day, weather)
    evaluation = evaluate_weather_day(day)
    current_status = BeachSafetyStatus.get_solo()

    if evaluation.recommended_status == current_status.published_status:
        return AutomationExecutionResult(
            status=AutomationRun.Status.SKIPPED,
            summary="Published beach safety status already matches the recommendation.",
            payload_snapshot={
                **weather_snapshot,
                "recommended_status": evaluation.recommended_status,
                "reasons": evaluation.reasons,
                "step_results": _build_beach_safety_step_results(
                    condition_positive=False,
                    action_status="skipped",
                    result_node_id="result_skipped",
                    condition_detail="La evaluacion no aporta un cambio efectivo sobre el estado ya publicado.",
                    action_detail="No se genera una nueva propuesta porque el estado publicado ya coincide.",
                    result_detail="La automatizacion termina sin cambios publicos ni nuevas propuestas.",
                ),
            },
        )

    proposal, created = BeachSafetyProposal.objects.get_or_create(
        recommendation_window_start=window_start,
        recommendation_window_end=window_end,
        defaults={
            "recommended_status": evaluation.recommended_status,
            "reasons": evaluation.reasons,
            "weather_snapshot": weather_snapshot,
            "weather_source_updated_at": weather.updated_at,
            "source_run": run,
            "proposed_at": now,
        },
    )

    if not created:
        proposal.source_run = proposal.source_run or run
        proposal.save(update_fields=["source_run", "fecha_modificacion"])

    return AutomationExecutionResult(
        status=AutomationRun.Status.SUCCEEDED,
        summary=(
            "Beach safety proposal created."
            if created
            else "Beach safety proposal already existed for the current window."
        ),
        payload_snapshot={
            **weather_snapshot,
            "recommended_status": evaluation.recommended_status,
            "reasons": evaluation.reasons,
            "proposal_created": created,
            "step_results": _build_beach_safety_step_results(
                condition_positive=True,
                action_status="completed",
                result_node_id="result_proposal",
                condition_detail="La evaluacion detecta un escenario que merece propuesta revisable.",
                action_detail=(
                    "Se ha creado una nueva propuesta para el equipo municipal."
                    if created
                    else "Ya existia una propuesta para esta ventana y se reutiliza."
                ),
                result_detail=(
                    "La propuesta queda lista para revision humana."
                    if created
                    else "La propuesta ya existia y sigue pendiente de revision."
                ),
            ),
        },
    )


def approve_proposal(proposal: BeachSafetyProposal, reviewer, review_notes: str = ""):
    if proposal.review_status != BeachSafetyProposal.ReviewStatus.PENDING:
        raise ValueError("Only pending proposals can be approved.")

    current_status = BeachSafetyStatus.get_solo()
    now = timezone.now()
    current_status.published_status = proposal.recommended_status
    current_status.published_at = now
    current_status.published_by = reviewer
    current_status.published_notes = review_notes or "\n".join(proposal.reasons)
    current_status.modificado_por = reviewer
    current_status.save()

    proposal.review_status = BeachSafetyProposal.ReviewStatus.APPROVED
    proposal.reviewed_at = now
    proposal.reviewed_by = reviewer
    proposal.review_notes = review_notes
    proposal.modificado_por = reviewer
    proposal.save()
    return proposal


def reject_proposal(proposal: BeachSafetyProposal, reviewer, review_notes: str = ""):
    if proposal.review_status != BeachSafetyProposal.ReviewStatus.PENDING:
        raise ValueError("Only pending proposals can be rejected.")

    proposal.review_status = BeachSafetyProposal.ReviewStatus.REJECTED
    proposal.reviewed_at = timezone.now()
    proposal.reviewed_by = reviewer
    proposal.review_notes = review_notes
    proposal.modificado_por = reviewer
    proposal.save()
    return proposal
