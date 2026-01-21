import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect } from "vitest";
import { render, screen } from "@/tests/test-utils";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
describe("DashboardLayout", () => {
    it("renders sidebar with navigation", () => {
        render(_jsx(DashboardLayout, {}));
        expect(screen.getByText("Resumen")).toBeInTheDocument();
        expect(screen.getByText("Usuarios")).toBeInTheDocument();
        expect(screen.getByText("Media")).toBeInTheDocument();
        expect(screen.getByText("Eventos")).toBeInTheDocument();
    });
    it("renders header", () => {
        render(_jsx(DashboardLayout, {}));
        // Header might not show logout button directly if user is not logged in or menu closed
        // but header should be present
        expect(screen.getByText(/Gaudeix/i)).toBeInTheDocument();
    });
});
