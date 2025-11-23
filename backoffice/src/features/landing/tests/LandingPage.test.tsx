import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import apiClient from "@/lib/api/client";

// Mock apiClient
vi.mock("@/lib/api/client", () => ({
  default: {
    get: vi.fn(),
  },
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("LandingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the landing page with title and description", () => {
    (apiClient.get as any).mockResolvedValue({
      status: 200,
      data: { status: "online", database: "ok" },
    });

    renderWithRouter(<LandingPage />);

    expect(screen.getByText("Gaudeix Codex")).toBeInTheDocument();
    expect(
      screen.getByText("Sistema de Gestión y Administración")
    ).toBeInTheDocument();
  });

  it("shows frontend status as online", () => {
    (apiClient.get as any).mockResolvedValue({
      status: 200,
      data: { status: "online", database: "ok" },
    });

    renderWithRouter(<LandingPage />);

    expect(screen.getByText("Frontend")).toBeInTheDocument();
    expect(screen.getByText("Backoffice Interface")).toBeInTheDocument();
  });

  it("calls health check on mount", async () => {
    (apiClient.get as any).mockResolvedValue({
      status: 200,
      data: { status: "online", database: "ok" },
    });

    renderWithRouter(<LandingPage />);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith("/health/");
    });
  });

  it("shows backend as online when health check succeeds", async () => {
    (apiClient.get as any).mockResolvedValue({
      status: 200,
      data: { status: "online", database: "ok" },
    });

    renderWithRouter(<LandingPage />);

    // Initially shows "Checking..."
    expect(screen.getByText("Checking...")).toBeInTheDocument();

    // After health check, shows "Online"
    await waitFor(() => {
      const badges = screen.getAllByText("Online");
      expect(badges.length).toBeGreaterThan(0);
    });

    // Database should show "Connected"
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("shows backend as offline when health check fails", async () => {
    (apiClient.get as any).mockRejectedValue(new Error("Network error"));

    renderWithRouter(<LandingPage />);

    // Initially shows "Checking..."
    expect(screen.getByText("Checking...")).toBeInTheDocument();

    // After health check fails, shows "Offline"
    await waitFor(() => {
      expect(screen.getByText("Offline")).toBeInTheDocument();
    });
  });

  it("shows database error when health check returns error status", async () => {
    (apiClient.get as any).mockResolvedValue({
      status: 200,
      data: { status: "online", database: "error" },
    });

    renderWithRouter(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
    });
  });

  it("renders login button with correct link", () => {
    (apiClient.get as any).mockResolvedValue({
      status: 200,
      data: { status: "online", database: "ok" },
    });

    renderWithRouter(<LandingPage />);

    const loginButton = screen.getByRole("link", {
      name: /acceder al backoffice/i,
    });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute("href", "/login");
  });
});
