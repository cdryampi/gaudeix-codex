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
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "online", database: "ok" }),
    } as any);

    renderWithRouter(<LandingPage />);

    expect(screen.getByText("Gaudeix Codex")).toBeInTheDocument();
    expect(
      screen.getByText("Sistema de Gestión y Administración")
    ).toBeInTheDocument();
  });

  it("shows frontend status as online", () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "online", database: "ok" }),
    } as any);

    renderWithRouter(<LandingPage />);

    expect(screen.getByText("Frontend")).toBeInTheDocument();
    expect(screen.getByText("Backoffice")).toBeInTheDocument();
  });

  it("calls health check on mount", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "online", database: "ok" }),
      } as any);

    renderWithRouter(<LandingPage />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  it("shows backend as online when health check succeeds", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
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

    // Database should show "Connected"
    expect(screen.getByText(/conectada/i)).toBeInTheDocument();
  });

  it("shows backend as offline when health check fails", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    renderWithRouter(<LandingPage />);

    // Initially shows "Verificando..."
    expect(screen.getByText(/verificando/i)).toBeInTheDocument();

    // After health check fails, shows "Offline"
    await waitFor(() => {
      expect(screen.getByText("Offline")).toBeInTheDocument();
    });
  });

  it("shows database error when health check returns error status", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "online", database: "error" }),
    } as any);

    renderWithRouter(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
    });
  });

  it("renders login button with correct link", () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
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
