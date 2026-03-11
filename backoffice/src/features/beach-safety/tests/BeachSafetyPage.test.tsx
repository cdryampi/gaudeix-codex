import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { render, screen, waitFor } from "@/tests/test-utils";

import { BeachSafetyPage } from "../pages/BeachSafetyPage";

vi.mock("../api/beachSafety", () => ({
  beachSafetyApi: {
    getStatus: vi.fn(),
    listProposals: vi.fn(),
    listRuns: vi.fn(),
    runCheck: vi.fn(),
    approveProposal: vi.fn(),
    rejectProposal: vi.fn(),
  },
}));

const { beachSafetyApi } = await import("../api/beachSafety");

const statusPayload = {
  id: 1,
  published_status: "green" as const,
  published_notes: "",
  published_at: "2026-06-20T09:00:00Z",
  published_by: null,
  latest_pending_proposal: {
    id: 99,
    recommended_status: "red" as const,
    review_status: "pending" as const,
    reasons: ["Se detecta tormenta o fenomeno severo."],
    weather_snapshot: {},
    weather_source_updated_at: "2026-06-20T08:00:00Z",
    recommendation_window_start: "2026-06-20T09:00:00Z",
    recommendation_window_end: "2026-06-20T12:00:00Z",
    proposed_at: "2026-06-20T09:05:00Z",
    reviewed_at: null,
    reviewed_by: null,
    review_notes: "",
    source_run: 5,
  },
  latest_run: {
    id: 5,
    trigger: "schedule" as const,
    status: "succeeded" as const,
    window_key: "window",
    started_at: "2026-06-20T09:00:00Z",
    finished_at: "2026-06-20T09:01:00Z",
    summary: "Beach safety proposal created.",
    error_message: "",
    weather_snapshot: {},
  },
  fecha_creacion: "2026-06-01T00:00:00Z",
  fecha_modificacion: "2026-06-20T09:05:00Z",
};

describe("BeachSafetyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (beachSafetyApi.getStatus as Mock).mockResolvedValue(statusPayload);
    (beachSafetyApi.listProposals as Mock).mockResolvedValue([
      statusPayload.latest_pending_proposal,
    ]);
    (beachSafetyApi.listRuns as Mock).mockResolvedValue([
      statusPayload.latest_run,
    ]);
    (beachSafetyApi.runCheck as Mock).mockResolvedValue({
      task_id: "task-1",
      queued: true,
      run_id: 5,
    });
    (beachSafetyApi.approveProposal as Mock).mockResolvedValue({
      ...statusPayload.latest_pending_proposal,
      review_status: "approved",
    });
    (beachSafetyApi.rejectProposal as Mock).mockResolvedValue({
      ...statusPayload.latest_pending_proposal,
      review_status: "rejected",
    });
  });

  it("renders current status, pending proposal, and histories", async () => {
    render(<BeachSafetyPage />);

    expect(
      screen.getByRole("heading", { name: "Seguridad de playas", level: 1 }),
    ).toBeInTheDocument();
    expect(await screen.findAllByText("Bandera roja")).toHaveLength(3);
    expect(screen.getByText("Estado publicado")).toBeInTheDocument();
    expect(screen.getByText("Historial de propuestas")).toBeInTheDocument();
    expect(screen.getByText("Historial de ejecuciones")).toBeInTheDocument();
  });

  it("triggers a manual review and refreshes the page", async () => {
    const user = userEvent.setup();
    render(<BeachSafetyPage />);

    await screen.findAllByText("Bandera roja");
    await user.click(screen.getByRole("button", { name: /revision manual/i }));

    await waitFor(() => {
      expect(beachSafetyApi.runCheck).toHaveBeenCalledTimes(1);
      expect(beachSafetyApi.getStatus).toHaveBeenCalledTimes(2);
    });
  });

  it("approves the pending proposal", async () => {
    const user = userEvent.setup();
    render(<BeachSafetyPage />);

    await screen.findAllByText("Bandera roja");
    await user.type(
      screen.getByLabelText("Notas de revision"),
      "Confirmado por operativa municipal",
    );
    await user.click(
      screen.getByRole("button", { name: /aprobar propuesta/i }),
    );

    await waitFor(() => {
      expect(beachSafetyApi.approveProposal).toHaveBeenCalledWith(
        99,
        "Confirmado por operativa municipal",
      );
    });
  });
});
