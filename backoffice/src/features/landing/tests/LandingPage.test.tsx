import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@/tests/test-utils";
import { LandingPage } from "../pages/LandingPage";

const mockHealthcheck = (database: "ok" | "error" = "ok") =>
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    ok: true,
    json: async () => ({ status: "online", database }),
  } as unknown as Response);

const renderLanding = () =>
  render(<LandingPage />, {
    router: { type: "memory", initialEntries: ["/"] },
  });

describe("LandingPage", () => {
  it("renders title and description", () => {
    mockHealthcheck();

    renderLanding();

    expect(screen.getByText(/gaudeix codex/i)).toBeInTheDocument();
    expect(screen.getByText(/panel de administración/i)).toBeInTheDocument();
  });

  it("calls health check on mount", async () => {
    const fetchSpy = mockHealthcheck();

    renderLanding();

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("shows backend as online when health check succeeds", async () => {
    mockHealthcheck();

    renderLanding();

    expect(screen.getByText(/verificando/i)).toBeInTheDocument();
    expect(await screen.findByText("Online")).toBeInTheDocument();
    expect(screen.getAllByText("✓").length).toBeGreaterThanOrEqual(2);
  });

  it("shows backend as offline when health check fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error"),
    );

    renderLanding();

    expect(screen.getByText(/verificando/i)).toBeInTheDocument();
    expect(await screen.findByText("Offline")).toBeInTheDocument();
  });

  it("shows database error when health check returns db error", async () => {
    mockHealthcheck("error");

    renderLanding();

    expect(await screen.findByText("Online")).toBeInTheDocument();
    expect(screen.getAllByText("✗").length).toBeGreaterThan(0);
  });

  it("renders login link", () => {
    mockHealthcheck();

    renderLanding();

    const loginButton = screen.getByRole("link", {
      name: /acceder al backoffice/i,
    });
    expect(loginButton).toHaveAttribute("href", "/login");
  });
});
