import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import userEvent from "@testing-library/user-event";

import { render, screen, waitFor } from "@/tests/test-utils";

import { AutomationsPage } from "../pages/AutomationsPage";

vi.mock("../api/automations", () => ({
  automationsApi: {
    listTemplates: vi.fn(),
    listJobs: vi.fn(),
    createJob: vi.fn(),
    updateJob: vi.fn(),
    runNow: vi.fn(),
    listRuns: vi.fn(),
  },
}));

const { automationsApi } = await import("../api/automations");

const templates = [
  {
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
  },
  {
    slug: "beach_safety.evaluate_red_flag_proposal",
    name: "Evaluacion seguridad playas",
    description: "Genera una propuesta revisable.",
    category: "public-safety",
    default_interval_hours: 3,
    supports_season_window: true,
    config_fields: [
      {
        key: "refresh_weather_before_run",
        label: "Refrescar meteo antes de ejecutar",
        field_type: "boolean",
        help_text: "Actualiza el snapshot meteo si hace falta.",
        required: false,
        default: true,
        min_value: null,
        max_value: null,
      },
    ],
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
  },
];

const jobs = [
  {
    id: 7,
    template_slug: "weather.refresh_municipality_forecast",
    template: templates[0],
    name: "Weather Refresh",
    status: "active" as const,
    interval_hours: 3,
    season_start_month: null,
    season_end_month: null,
    config: {},
    last_run_at: "2026-06-20T09:00:00Z",
    next_run_at: "2026-06-20T12:00:00Z",
    last_run_status: "succeeded" as const,
    latest_run: null,
    fecha_creacion: "2026-06-20T08:00:00Z",
    fecha_modificacion: "2026-06-20T09:00:00Z",
  },
];

const runs = [
  {
    id: 12,
    automation: 7,
    trigger: "schedule" as const,
    status: "succeeded" as const,
    started_at: "2026-06-20T09:00:00Z",
    finished_at: "2026-06-20T09:01:00Z",
    summary: "Municipality weather forecast refreshed.",
    error_message: "",
    payload_snapshot: { source: "open_meteo" },
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
  },
];

describe("AutomationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (automationsApi.listTemplates as Mock).mockResolvedValue(templates);
    (automationsApi.listJobs as Mock).mockResolvedValue(jobs);
    (automationsApi.listRuns as Mock).mockResolvedValue(runs);
    (automationsApi.createJob as Mock).mockResolvedValue({
      ...jobs[0],
      id: 8,
      template_slug: "beach_safety.evaluate_red_flag_proposal",
      template: templates[1],
      name: "Playas",
      season_start_month: 6,
      season_end_month: 9,
      config: { refresh_weather_before_run: true },
    });
    (automationsApi.updateJob as Mock).mockResolvedValue({
      ...jobs[0],
      status: "paused",
    });
    (automationsApi.runNow as Mock).mockResolvedValue({
      task_id: "task-1",
      queued: true,
      run_id: 12,
    });
  });

  it("renders templates, jobs, and run history", async () => {
    render(<AutomationsPage />);

    expect(
      screen.getByRole("heading", { name: "Automatizaciones", level: 1 }),
    ).toBeInTheDocument();
    expect(
      (await screen.findAllByText("Weather Refresh")).length,
    ).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Flujos listos para operar")).toBeInTheDocument();
    expect(await screen.findByText(/execution history/i)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /evaluacion seguridad playas/i }),
    );

    expect(
      await screen.findByRole("link", { name: /revisar propuestas/i }),
    ).toHaveAttribute("href", "/dashboard/automations/beach-safety");
  });

  it("creates a new automation from a template", async () => {
    const user = userEvent.setup();
    (automationsApi.listJobs as Mock)
      .mockResolvedValueOnce(jobs)
      .mockResolvedValueOnce([
        ...jobs,
        {
          ...jobs[0],
          id: 8,
          template_slug: "beach_safety.evaluate_red_flag_proposal",
          template: templates[1],
          name: "Playas",
          season_start_month: 6,
          season_end_month: 9,
          config: { refresh_weather_before_run: true },
        },
      ]);

    render(<AutomationsPage />);

    expect(
      await screen.findByRole("button", {
        name: /evaluacion seguridad playas/i,
      }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /evaluacion seguridad playas/i }),
    );
    const nameInput = await screen.findByLabelText("Nombre visible");
    await user.clear(nameInput);
    await user.type(nameInput, "Playas");
    const activateButtons = screen.getAllByRole("button", {
      name: /activar automatizacion/i,
    });
    await user.click(activateButtons[activateButtons.length - 1]);

    await waitFor(() => {
      expect(automationsApi.createJob).toHaveBeenCalledWith(
        expect.objectContaining({
          template_slug: "beach_safety.evaluate_red_flag_proposal",
          name: "Playas",
        }),
      );
    });
  });

  it("disables creation affordances when all templates are already active", async () => {
    (automationsApi.listJobs as Mock).mockResolvedValue([
      jobs[0],
      {
        ...jobs[0],
        id: 8,
        template_slug: "beach_safety.evaluate_red_flag_proposal",
        template: templates[1],
        name: "Playas",
        season_start_month: 6,
        season_end_month: 9,
        config: { refresh_weather_before_run: true },
      },
    ]);

    render(<AutomationsPage />);

    const disabledButtons = await screen.findAllByRole("button", {
      name: /nuevas plantillas proximamente/i,
    });
    disabledButtons.forEach((button) => expect(button).toBeDisabled());
    expect(
      screen.getByText(/todas las plantillas disponibles ya estan activadas/i),
    ).toBeInTheDocument();
    expect(automationsApi.createJob).not.toHaveBeenCalled();
  });

  it("runs an automation manually", async () => {
    const user = userEvent.setup();
    render(<AutomationsPage />);

    expect(
      (await screen.findAllByText("Weather Refresh")).length,
    ).toBeGreaterThanOrEqual(2);
    await user.click(
      await screen.findByRole("button", { name: /test \/ run now/i }),
    );

    await waitFor(() => {
      expect(automationsApi.runNow).toHaveBeenCalledWith(7);
      expect(automationsApi.listJobs).toHaveBeenCalledTimes(2);
    });
  });
});
