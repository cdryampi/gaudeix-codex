import { describe, expect, it } from "vitest";
import { render, screen } from "@/tests/test-utils";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";

describe("DashboardLayout", () => {
  it("renders sidebar navigation links", () => {
    render(<DashboardLayout />);

    expect(screen.getByRole("link", { name: /resumen/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /usuarios/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /media/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /eventos/i })).toBeInTheDocument();
  });

  it("renders the dashboard header branding", () => {
    render(<DashboardLayout />);
    expect(screen.getByText(/gaudeix/i)).toBeInTheDocument();
  });
});
