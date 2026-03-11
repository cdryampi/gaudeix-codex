from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import TYPE_CHECKING, Callable

from django.core.exceptions import ValidationError

from site_settings.services import WeatherService

if TYPE_CHECKING:
    from .models import AutomationJob, AutomationRun


@dataclass(frozen=True)
class AutomationExecutionResult:
    status: str
    summary: str = ""
    error_message: str = ""
    payload_snapshot: dict = field(default_factory=dict)


@dataclass(frozen=True)
class AutomationConfigField:
    key: str
    label: str
    field_type: str
    help_text: str = ""
    required: bool = False
    default: object | None = None
    min_value: int | None = None
    max_value: int | None = None

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass(frozen=True)
class AutomationEditorNode:
    id: str
    node_kind: str
    node_title: str
    node_description: str
    chip_label: str = ""
    editable_fields: tuple[str, ...] = ()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "node_kind": self.node_kind,
            "node_title": self.node_title,
            "node_description": self.node_description,
            "chip_label": self.chip_label,
            "editable_fields": list(self.editable_fields),
        }


@dataclass(frozen=True)
class AutomationEditorBranch:
    id: str
    label: str
    title: str
    description: str
    tone: str
    terminal_statuses: tuple[str, ...]

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "label": self.label,
            "title": self.title,
            "description": self.description,
            "tone": self.tone,
            "terminal_statuses": list(self.terminal_statuses),
        }


@dataclass(frozen=True)
class AutomationEditorFlow:
    nodes: tuple[AutomationEditorNode, ...]
    result_branches: tuple[AutomationEditorBranch, ...]

    def to_dict(self) -> dict:
        return {
            "node_order": [node.id for node in self.nodes],
            "nodes": [node.to_dict() for node in self.nodes],
            "result_branches": [branch.to_dict() for branch in self.result_branches],
        }


@dataclass(frozen=True)
class AutomationTemplateDefinition:
    slug: str
    name: str
    description: str
    category: str
    default_interval_hours: int
    supports_season_window: bool = False
    config_fields: tuple[AutomationConfigField, ...] = ()
    editor_flow: AutomationEditorFlow | None = None
    validate_config: Callable[[dict], dict] | None = None
    execute: Callable[["AutomationJob", "AutomationRun", str], AutomationExecutionResult] | None = None

    def serialize(self) -> dict:
        return {
            "slug": self.slug,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "default_interval_hours": self.default_interval_hours,
            "supports_season_window": self.supports_season_window,
            "config_fields": [field.to_dict() for field in self.config_fields],
            "editor_flow": self.editor_flow.to_dict() if self.editor_flow else None,
        }


def _validate_empty_config(config: dict) -> dict:
    if config:
        raise ValidationError({"config": "This automation does not accept custom config."})
    return {}


def _validate_beach_safety_config(config: dict) -> dict:
    config = dict(config or {})
    refresh_weather_before_run = config.get("refresh_weather_before_run", True)
    if not isinstance(refresh_weather_before_run, bool):
        raise ValidationError(
            {"config": {"refresh_weather_before_run": "Must be a boolean value."}}
        )
    return {"refresh_weather_before_run": refresh_weather_before_run}


def _build_weather_step_results(*, success: bool, error_message: str = "") -> list[dict]:
    return [
        {
            "node_id": "trigger",
            "node_title": "Trigger horario",
            "node_kind": "trigger",
            "status": "completed",
            "detail": "La automatizacion se ha ejecutado en su ventana programada.",
        },
        {
            "node_id": "action",
            "node_title": "Refrescar pronostico municipal",
            "node_kind": "action",
            "status": "completed" if success else "failed",
            "detail": (
                "El pronostico municipal se ha actualizado correctamente."
                if success
                else error_message or "No se pudo actualizar el pronostico municipal."
            ),
        },
        {
            "node_id": "result_updated",
            "node_title": "Forecast updated",
            "node_kind": "result",
            "status": "completed" if success else "inactive",
            "detail": "El snapshot meteorologico queda listo para el resto de automatizaciones.",
        },
        {
            "node_id": "result_error",
            "node_title": "Provider error",
            "node_kind": "result",
            "status": "completed" if not success else "inactive",
            "detail": (
                error_message or "La fuente meteorologica ha fallado y se ha registrado el error."
            ),
        },
    ]


def _build_beach_safety_step_results(
    *,
    condition_positive: bool | None,
    action_status: str,
    result_node_id: str,
    condition_detail: str,
    action_detail: str,
    result_detail: str,
) -> list[dict]:
    condition_status = "failed" if condition_positive is None else "completed"
    return [
        {
            "node_id": "trigger",
            "node_title": "Trigger horario",
            "node_kind": "trigger",
            "status": "completed",
            "detail": "La automatizacion revisa el clima municipal segun la frecuencia configurada.",
        },
        {
            "node_id": "condition",
            "node_title": "Evaluar riesgo meteorologico",
            "node_kind": "condition",
            "status": condition_status,
            "detail": condition_detail,
        },
        {
            "node_id": "action",
            "node_title": "Generar propuesta revisable",
            "node_kind": "action",
            "status": action_status,
            "detail": action_detail,
        },
        {
            "node_id": "result_proposal",
            "node_title": "Proposal created",
            "node_kind": "result",
            "status": "completed" if result_node_id == "result_proposal" else "inactive",
            "detail": (
                result_detail
                if result_node_id == "result_proposal"
                else "No se ha generado una nueva propuesta en esta ejecucion."
            ),
        },
        {
            "node_id": "result_skipped",
            "node_title": "No changes",
            "node_kind": "result",
            "status": "completed" if result_node_id == "result_skipped" else "inactive",
            "detail": (
                result_detail
                if result_node_id == "result_skipped"
                else "El estado publicado no ha necesitado cambios."
            ),
        },
        {
            "node_id": "result_error",
            "node_title": "Error",
            "node_kind": "result",
            "status": "completed" if result_node_id == "result_error" else "inactive",
            "detail": (
                result_detail
                if result_node_id == "result_error"
                else "No se han producido errores en esta ejecucion."
            ),
        },
    ]


def _execute_weather_refresh(job: "AutomationJob", run: "AutomationRun", trigger: str) -> AutomationExecutionResult:
    weather = WeatherService.update_forecast()
    if weather is None:
        return AutomationExecutionResult(
            status="failed",
            error_message="Weather data refresh failed.",
            payload_snapshot={
                "step_results": _build_weather_step_results(
                    success=False,
                    error_message="Weather data refresh failed.",
                )
            },
        )

    payload_snapshot = {
        "source": weather.forecast_data.get("source"),
        "address": weather.forecast_data.get("address"),
        "days_count": len(weather.forecast_data.get("days", [])),
        "updated_at": weather.updated_at.isoformat() if weather.updated_at else None,
        "step_results": _build_weather_step_results(success=True),
    }
    return AutomationExecutionResult(
        status="succeeded",
        summary="Municipality weather forecast refreshed.",
        payload_snapshot=payload_snapshot,
    )


def _execute_beach_safety(job: "AutomationJob", run: "AutomationRun", trigger: str) -> AutomationExecutionResult:
    from beach_safety.services import execute_beach_safety_check

    return execute_beach_safety_check(
        run=run,
        refresh_weather_before_run=job.config.get("refresh_weather_before_run", True),
    )


AUTOMATION_TEMPLATES: dict[str, AutomationTemplateDefinition] = {
    "weather.refresh_municipality_forecast": AutomationTemplateDefinition(
        slug="weather.refresh_municipality_forecast",
        name="Refresco meteorologico municipal",
        description="Actualiza el ultimo pronostico meteorologico municipal.",
        category="weather",
        default_interval_hours=3,
        editor_flow=AutomationEditorFlow(
            nodes=(
                AutomationEditorNode(
                    id="trigger",
                    node_kind="trigger",
                    node_title="Trigger horario",
                    node_description="Lanza la automatizacion con una frecuencia simple y predecible.",
                    chip_label="Horario",
                    editable_fields=("status", "interval_hours"),
                ),
                AutomationEditorNode(
                    id="action",
                    node_kind="action",
                    node_title="Refrescar pronostico municipal",
                    node_description="Consulta el proveedor meteorologico y actualiza el snapshot municipal.",
                    chip_label="Weather",
                    editable_fields=(),
                ),
            ),
            result_branches=(
                AutomationEditorBranch(
                    id="result_updated",
                    label="Updated",
                    title="Forecast updated",
                    description="Guarda un nuevo pronostico municipal para el resto de automatizaciones.",
                    tone="success",
                    terminal_statuses=("succeeded",),
                ),
                AutomationEditorBranch(
                    id="result_error",
                    label="Error",
                    title="Provider error",
                    description="Registra el fallo de la fuente y deja trazabilidad operativa en el historial.",
                    tone="error",
                    terminal_statuses=("failed",),
                ),
            ),
        ),
        validate_config=_validate_empty_config,
        execute=_execute_weather_refresh,
    ),
    "beach_safety.evaluate_red_flag_proposal": AutomationTemplateDefinition(
        slug="beach_safety.evaluate_red_flag_proposal",
        name="Evaluacion de seguridad de playas",
        description="Evalua el clima municipal y genera una propuesta revisable de estado de playas.",
        category="public-safety",
        default_interval_hours=3,
        supports_season_window=True,
        config_fields=(
            AutomationConfigField(
                key="refresh_weather_before_run",
                label="Refrescar meteo antes de ejecutar",
                field_type="boolean",
                help_text="Actualiza el clima municipal si el ultimo snapshot esta desactualizado.",
                default=True,
            ),
        ),
        editor_flow=AutomationEditorFlow(
            nodes=(
                AutomationEditorNode(
                    id="trigger",
                    node_kind="trigger",
                    node_title="Trigger de temporada",
                    node_description="Se ejecuta cada pocas horas durante la ventana estacional configurada.",
                    chip_label="Seasonal",
                    editable_fields=(
                        "status",
                        "interval_hours",
                        "season_start_month",
                        "season_end_month",
                    ),
                ),
                AutomationEditorNode(
                    id="condition",
                    node_kind="condition",
                    node_title="Evaluar riesgo meteorologico",
                    node_description="Comprueba si hay señales de riesgo para playas segun el ultimo parte municipal.",
                    chip_label="Condition",
                    editable_fields=(),
                ),
                AutomationEditorNode(
                    id="action",
                    node_kind="action",
                    node_title="Generar propuesta revisable",
                    node_description="Crea una propuesta pendiente para revision humana sin publicar cambios automaticamente.",
                    chip_label="Public safety",
                    editable_fields=("config.refresh_weather_before_run",),
                ),
            ),
            result_branches=(
                AutomationEditorBranch(
                    id="result_proposal",
                    label="Proposal",
                    title="Proposal created",
                    description="Se genera una propuesta revisable cuando hay riesgo o una recomendacion nueva.",
                    tone="success",
                    terminal_statuses=("succeeded",),
                ),
                AutomationEditorBranch(
                    id="result_skipped",
                    label="No changes",
                    title="No changes",
                    description="No toca el estado publicado cuando no hay cambios relevantes o ya coincide.",
                    tone="warning",
                    terminal_statuses=("skipped",),
                ),
                AutomationEditorBranch(
                    id="result_error",
                    label="Error",
                    title="Evaluation error",
                    description="Registra el error si faltan datos meteorologicos o falla la evaluacion.",
                    tone="error",
                    terminal_statuses=("failed",),
                ),
            ),
        ),
        validate_config=_validate_beach_safety_config,
        execute=_execute_beach_safety,
    ),
}


def get_template_definition(slug: str) -> AutomationTemplateDefinition:
    try:
        return AUTOMATION_TEMPLATES[slug]
    except KeyError as exc:
        raise ValidationError({"template_slug": "Unknown automation template."}) from exc


def list_template_definitions() -> list[AutomationTemplateDefinition]:
    return list(AUTOMATION_TEMPLATES.values())
