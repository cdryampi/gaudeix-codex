import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render as rtlRender, screen } from "@testing-library/react";
import { render } from "@/tests/test-utils";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { AuthLayout } from "../components/AuthLayout";
// Mock environment variables if needed, but we are using defaults in env.ts so it should be fine.
describe("Auth Feature", () => {
    describe("AuthLayout", () => {
        it("renders children correctly via Outlet", () => {
            rtlRender(_jsx(MemoryRouter, { initialEntries: ["/test"], children: _jsx(Routes, { children: _jsx(Route, { element: _jsx(AuthLayout, {}), children: _jsx(Route, { path: "/test", element: _jsx("div", { "data-testid": "child", children: "Child Content" }) }) }) }) }));
            expect(screen.getByTestId("child")).toBeInTheDocument();
        });
    });
    describe("LoginPage", () => {
        it("renders login form with email and password inputs", () => {
            render(_jsx(LoginPage, {}));
            expect(screen.getByLabelText(/usuario o email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument();
        });
    });
    describe("RegisterPage", () => {
        it("renders register form with all inputs", () => {
            render(_jsx(RegisterPage, {}));
            expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /registrarse/i })).toBeInTheDocument();
        });
    });
    describe("ResetPasswordPage", () => {
        it("renders reset password form", () => {
            render(_jsx(ResetPasswordPage, {}));
            expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /enviar instrucciones/i })).toBeInTheDocument();
        });
    });
});
