import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@/tests/test-utils";

import { AutomationDashboard } from "../components/AutomationDashboard";
import { AutomationHistoryView } from "../components/AutomationHistoryView";
import { AutomationSidebar } from "../components/AutomationSidebar";
import type {
  AutomationConfigField,
  AutomationJob,
  AutomationRun,
  AutomationTemplate,
} from "../types";

const refreshWeatherField: AutomationConfigField = {
  key: "refresh_weather_before_run",
  label: "Refrescar meteo antes de ejecutar",
  field_type: "boolean",
  help_text: "Actualiza el snapshot meteo si hace falta.",
  required: false,
  default: true,
  min_value: null,
  max_value: null,
};

const weatherTemplate: AutomationTemplate = {
  slug: "weather.refresh_municipality_forecast",
  name: "Refresco meteo municipal",
  description: "Actualiza el pronostico municipal.",
  category: "weather",
  default_interval_hours: 3,
  supports_season_window: false,
  config_fields: [],
  editor_flow: {
    node_order: ["trigger", "action"],
    nodes: [
      {
        id: "trigger",
        node_kind: "trigger",
        node_title: "Trigger horario",
        node_description: "Lanza la automatizacion cada pocas horas.",
        chip_label: "Horario",
        editable_fields: ["status", "interval_hours"],
      },
      {
        id: "action",
        node_kind: "action",
        node_title: "Refrescar pronostico municipal",
        node_description: "Actualiza el snapshot municipal.",
        chip_label: "Weather",
        editable_fields: [],
      },
    ],
    result_branches: [
      {
        id: "result_updated",
        label: "Updated",
        title: "Forecast updated",
        description: "Guarda un nuevo pronostico.",
        tone: "success",
        terminal_statuses: ["succeeded"],
      },
      {
        id: "result_error",
        label: "Error",
        title: "Provider error",
        description: "Registra el error de proveedor.",
        tone: "error",
        terminal_statuses: ["failed"],
      },
    ],
  },
};

const beachTemplate: AutomationTemplate = {
  slug: "beach_safety.evaluate_red_flag_proposal",
  name: "Evaluacion seguridad playas",
  description: "Genera una propuesta revisable.",
  category: "public-safety",
  default_interval_hours: 3,
  supports_season_window: true,
  config_fields: [refreshWeatherField],
  editor_flow: {
    node_order: ["trigger", "condition", "action"],
    nodes: [
      {
        id: "trigger",
        node_kind: "trigger",
        node_title: "Trigger de temporada",
        node_description: "Se ejecuta en temporada.",
        chip_label: "Seasonal",
        editable_fields: [
          "status",
          "interval_hours",
          "season_start_month",
          "season_end_month",
        ],
      },
      {
        id: "condition",
        node_kind: "condition",
        node_title: "Evaluar riesgo meteorologico",
        node_description: "Comprueba señales de riesgo.",
        chip_label: "Condition",
        editable_fields: [],
      },
      {
        id: "action",
        node_kind: "action",
        node_title: "Generar propuesta revisable",
        node_description: "Crea una propuesta pendiente.",
        chip_label: "Safety",
        editable_fields: ["config.refresh_weather_before_run"],
      },
    ],
    result_branches: [
      {
        id: "result_proposal",
        label: "Proposal",
        title: "Proposal created",
        description: "Crea propuesta.",
        tone: "success",
        terminal_statuses: ["succeeded"],
      },
      {
        id: "result_skipped",
        label: "No changes",
        title: "No changes",
        description: "No toca estado.",
        tone: "warning",
        terminal_statuses: ["skipped"],
      },
      {
        id: "result_error",
        label: "Error",
        title: "Evaluation error",
        description: "Marca error.",
        tone: "error",
        terminal_statuses: ["failed"],
      },
    ],
  },
};

const weatherRun: AutomationRun = {
  id: 12,
  automation: 7,
  trigger: "schedule",
  status: "succeeded",
  started_at: "2026-06-20T09:00:00Z",
  finished_at: "2026-06-20T09:01:00Z",
  summary: "Municipality weather forecast refreshed.",
  error_message: "",
  payload_snapshot: { source: "open_meteo", mode: "latest" },
  step_results: [
    {
      node_id: "trigger",
      node_title: "Trigger horario",
      node_kind: "trigger",
      status: "completed",
      detail: "Se ha ejecutado segun lo previsto.",
    },
    {
      node_id: "action",
      node_title: "Refrescar pronostico municipal",
      node_kind: "action",
      status: "completed",
      detail: "Pronostico actualizado.",
    },
    {
      node_id: "result_updated",
      node_title: "Forecast updated",
      node_kind: "result",
      status: "completed",
      detail: "Pronostico listo.",
    },
  ],
  window_key: "2026-06-20T09:00:00+00:00",
};

const skippedBeachRun: AutomationRun = {
  id: 21,
  automation: 8,
  trigger: "manual",
  status: "skipped",
  started_at: "2026-06-21T09:00:00Z",
  finished_at: "2026-06-21T09:01:00Z",
  summary: "No changes required.",
  error_message: "",
  payload_snapshot: { reason: "already-green" },
  step_results: [
    {
      node_id: "trigger",
      node_title: "Trigger de temporada",
      node_kind: "trigger",
      status: "completed",
      detail: "Revision lanzada.",
    },
    {
      node_id: "condition",
      node_title: "Evaluar riesgo meteorologico",
      node_kind: "condition",
      status: "completed",
      detail: "No se detectan cambios relevantes.",
    },
    {
      node_id: "action",
      node_title: "Generar propuesta revisable",
      node_kind: "action",
      status: "skipped",
      detail: "No se crea propuesta porque el estado ya coincide.",
    },
    {
      node_id: "result_skipped",
      node_title: "No changes",
      node_kind: "result",
      status: "completed",
      detail: "El estado publicado ya coincide.",
    },
  ],
  window_key: "window-skipped",
};

const beachJob: AutomationJob = {
  id: 8,
  template_slug: beachTemplate.slug,
  template: beachTemplate,
  name: "Playas",
  status: "active",
  interval_hours: 3,
  season_start_month: 6,
  season_end_month: 9,
  config: { refresh_weather_before_run: true },
  last_run_at: "2026-06-21T09:01:00Z",
  next_run_at: "2026-06-21T12:00:00Z",
  last_run_status: "skipped",
  latest_run: skippedBeachRun,
  fecha_creacion: "2026-06-20T08:00:00Z",
  fecha_modificacion: "2026-06-21T09:01:00Z",
};

describe("Automation components", () => {
  it("shows the future state when there are no templates left to activate", async () => {
    const user = userEvent.setup();
    const onCreateFlow = vi.fn();
    const onSelect = vi.fn();

    render(
      <AutomationDashboard
        entries={[
          {
            template: weatherTemplate,
            job: {
              ...beachJob,
              id: 7,
              template_slug: weatherTemplate.slug,
              template: weatherTemplate,
              name: "Weather Refresh",
              season_start_month: null,
              season_end_month: null,
              config: {},
              latest_run: weatherRun,
              last_run_status: "succeeded",
            },
          },
          { template: beachTemplate, job: beachJob },
        ]}
        selectedTemplateSlug={weatherTemplate.slug}
        canCreateFlow={false}
        onSelect={onSelect}
        onCreateFlow={onCreateFlow}
      />,
    );

    const disabledButtons = screen.getAllByRole("button", {
      name: /nuevas plantillas proximamente/i,
    });
    disabledButtons.forEach((button) => expect(button).toBeDisabled());
    expect(
      screen.getByText(/todas las plantillas disponibles ya estan activadas/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /playas/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onCreateFlow).not.toHaveBeenCalled();
  });

  it("renders the sidebar for beach safety and lets the operator trigger actions", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onRunNow = vi.fn();
    const onFormPatch = vi.fn();
    const onConfigChange = vi.fn();

    render(
      <AutomationSidebar
        template={beachTemplate}
        job={beachJob}
        selectedNode={beachTemplate.editor_flow!.nodes[2]}
        selectedBranch={null}
        latestRun={skippedBeachRun}
        formState={{
          template_slug: beachTemplate.slug,
          name: "Playas",
          status: "active",
          interval_hours: "3",
          season_start_month: "6",
          season_end_month: "9",
          config: { refresh_weather_before_run: true },
        }}
        saving={false}
        onFormPatch={onFormPatch}
        onConfigChange={onConfigChange}
        onSave={onSave}
        onRunNow={onRunNow}
      />,
      {
        router: { type: "memory", initialEntries: ["/dashboard/automations"] },
      },
    );

    expect(screen.getByText("Configurar accion")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /revisar propuestas de playas/i }),
    ).toHaveAttribute("href", "/dashboard/automations/beach-safety");

    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));
    await user.click(screen.getByRole("button", { name: /test step/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onRunNow).toHaveBeenCalledTimes(1);
  });

  it("renders history playback and lets the operator inspect another run", async () => {
    const user = userEvent.setup();

    render(
      <AutomationHistoryView
        template={beachTemplate}
        job={beachJob}
        runs={[
          skippedBeachRun,
          {
            ...weatherRun,
            id: 22,
            automation: beachJob.id,
            summary: "Proposal created after severe storm.",
            status: "failed",
            error_message: "Provider timeout",
            payload_snapshot: { source: "fallback" },
            step_results: [
              {
                node_id: "trigger",
                node_title: "Trigger de temporada",
                node_kind: "trigger",
                status: "completed",
                detail: "Revision lanzada.",
              },
              {
                node_id: "condition",
                node_title: "Evaluar riesgo meteorologico",
                node_kind: "condition",
                status: "failed",
                detail: "Fallo al evaluar el proveedor.",
              },
              {
                node_id: "result_error",
                node_title: "Evaluation error",
                node_kind: "result",
                status: "completed",
                detail: "Provider timeout",
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("Historial de runs")).toBeInTheDocument();
    expect(screen.getAllByText("No changes required.").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText(/already-green/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /run #22/i }));

    expect(
      screen.getAllByText("Proposal created after severe storm.").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Provider timeout").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /copiar json/i }),
    ).toBeInTheDocument();
  });
});
