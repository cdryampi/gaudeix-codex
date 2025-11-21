import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { AuthLayout } from "../components/AuthLayout";

// Mock environment variables if needed, but we are using defaults in env.ts so it should be fine.

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Auth Feature", () => {
  describe("AuthLayout", () => {
    it("renders children correctly via Outlet", () => {
      render(
        <MemoryRouter initialEntries={["/test"]}>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route
                path="/test"
                element={<div data-testid="child">Child Content</div>}
              />
            </Route>
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  describe("LoginPage", () => {
    it("renders login form with email and password inputs", () => {
      renderWithRouter(<LoginPage />);
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /ingresar/i })
      ).toBeInTheDocument();
    });
  });

  describe("RegisterPage", () => {
    it("renders register form with all inputs", () => {
      renderWithRouter(<RegisterPage />);
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/confirmar contraseña/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /registrarse/i })
      ).toBeInTheDocument();
    });
  });

  describe("ResetPasswordPage", () => {
    it("renders reset password form", () => {
      renderWithRouter(<ResetPasswordPage />);
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /enviar instrucciones/i })
      ).toBeInTheDocument();
    });
  });
});
