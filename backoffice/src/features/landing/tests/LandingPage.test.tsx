import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("LandingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("renders the landing page with title and description", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "online", database: "ok" }),
    } as any);

    renderWithRouter(<LandingPage />);

    expect(screen.getByText("Gaudeix Codex")).toBeInTheDocument();
    expect(screen.getByText("Panel de Administración")).toBeInTheDocument();
  });

  it("shows frontend status as online", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "online", database: "ok" }),
    } as any);

    renderWithRouter(<LandingPage />);

    expect(screen.getByText("Frontend")).toBeInTheDocument();
    expect(screen.getAllByText("Backoffice").length).toBeGreaterThan(0);
  });

  it("calls health check on mount", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "online", database: "ok" }),
    } as any);

    renderWithRouter(<LandingPage />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  it("shows backend as online when health check succeeds", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "online", database: "ok" }),
    } as any);

    renderWithRouter(<LandingPage />);

    // Initially shows "Verificando..."
    expect(screen.getByText(/verificando/i)).toBeInTheDocument();

    // After health check, shows "Online"
    await waitFor(() => {
      const badges = screen.getAllByText("Online");
      expect(badges.length).toBeGreaterThan(0);
    });

    // Django API + PostgreSQL checks should be OK
    await waitFor(() => {
      expect(screen.getAllByText("✓").length).toBeGreaterThanOrEqual(2);
    });
  });

  it("shows backend as offline when health check fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error"),
    );

    renderWithRouter(<LandingPage />);

    // Initially shows "Verificando..."
    expect(screen.getByText(/verificando/i)).toBeInTheDocument();

    // After health check fails, shows "Offline"
    await waitFor(() => {
      expect(screen.getByText("Offline")).toBeInTheDocument();
    });
  });

  it("shows database error when health check returns error status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "online", database: "error" }),
    } as any);

    renderWithRouter(<LandingPage />);

    await waitFor(() => {
      const badges = screen.getAllByText("Online");
      expect(badges.length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(screen.getAllByText("✗").length).toBeGreaterThan(0);
    });
  });

  it("renders login button with correct link", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "online", database: "ok" }),
    } as any);

    renderWithRouter(<LandingPage />);

    const loginButton = screen.getByRole("link", {
      name: /acceder al backoffice/i,
    });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute("href", "/login");
  });
});
