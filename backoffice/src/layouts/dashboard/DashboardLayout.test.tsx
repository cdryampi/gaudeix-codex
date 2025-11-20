import { describe, it, expect } from "vitest";
import { render, screen } from "@/tests/test-utils";
import { DashboardLayout } from "@/layouts/dashboard/DashboardLayout";

describe("DashboardLayout", () => {
  it("renders sidebar with navigation", () => {
    render(<DashboardLayout />);

    // Check for navigation items
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Usuarios")).toBeInTheDocument();
    expect(screen.getByText("Media")).toBeInTheDocument();
    expect(screen.getByText("Eventos")).toBeInTheDocument();
  });

  it("renders header", () => {
    render(<DashboardLayout />);

    expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
  });
});
