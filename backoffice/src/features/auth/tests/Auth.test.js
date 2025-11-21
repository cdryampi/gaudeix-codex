import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { AuthLayout } from "../components/AuthLayout";
// Mock environment variables if needed, but we are using defaults in env.ts so it should be fine.
const renderWithRouter = (component) => {
    return render(_jsx(BrowserRouter, { children: component }));
};
describe("Auth Feature", () => {
    describe("AuthLayout", () => {
        it("renders children correctly via Outlet", () => {
            render(_jsx(MemoryRouter, { initialEntries: ["/test"], children: _jsx(Routes, { children: _jsx(Route, { element: _jsx(AuthLayout, {}), children: _jsx(Route, { path: "/test", element: _jsx("div", { "data-testid": "child", children: "Child Content" }) }) }) }) }));
            expect(screen.getByTestId("child")).toBeInTheDocument();
        });
    });
    describe("LoginPage", () => {
        it("renders login form with email and password inputs", () => {
            renderWithRouter(_jsx(LoginPage, {}));
            expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /ingresar/i })).toBeInTheDocument();
        });
    });
    describe("RegisterPage", () => {
        it("renders register form with all inputs", () => {
            renderWithRouter(_jsx(RegisterPage, {}));
            expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /registrarse/i })).toBeInTheDocument();
        });
    });
    describe("ResetPasswordPage", () => {
        it("renders reset password form", () => {
            renderWithRouter(_jsx(ResetPasswordPage, {}));
            expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /enviar instrucciones/i })).toBeInTheDocument();
        });
    });
});
