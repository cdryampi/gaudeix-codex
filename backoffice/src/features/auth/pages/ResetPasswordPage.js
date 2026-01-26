import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthForm } from "../hooks/useAuthForm";
import { API_CONFIG, API_ENDPOINTS } from "@/lib/config/constants";
import { ArrowLeft, Mail } from "lucide-react";
const resetSchema = z.object({
  email: z.string().email("Email inválido"),
});
export const ResetPasswordPage = () => {
  const { values, errors, isSubmitting, handleChange, handleSubmit } =
    useAuthForm({
      schema: resetSchema,
      defaultValues: { email: "" },
      onSubmit: async (data) => {
        console.log("Reset password attempt:", data);
        console.log(
          "Target URL:",
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.PASSWORD_RESET}`,
        );
        // Placeholder for actual reset logic
      },
    });
  return _jsxs("div", {
    className: "w-full space-y-6 animate-in fade-in duration-500",
    children: [
      _jsxs("div", {
        className: "space-y-2 text-center",
        children: [
          _jsx("h2", {
            className:
              "text-xl font-semibold tracking-tight text-gray-900 dark:text-white",
            children: "Recuperar Contrase\u00F1a",
          }),
          _jsx("p", {
            className: "text-sm text-gray-500 dark:text-gray-400",
            children: "Te enviaremos instrucciones a tu correo",
          }),
        ],
      }),
      _jsxs("form", {
        onSubmit: handleSubmit,
        className: "space-y-5",
        autoComplete: "on",
        children: [
          _jsxs("div", {
            className: "space-y-2",
            children: [
              _jsx(Label, {
                htmlFor: "email",
                className: "text-gray-700 dark:text-gray-300",
                children: "Correo electr\u00F3nico",
              }),
              _jsxs("div", {
                className: "relative",
                children: [
                  _jsx(Input, {
                    id: "email",
                    name: "email",
                    type: "email",
                    placeholder: "nombre@ejemplo.com",
                    value: values.email,
                    onChange: handleChange,
                    className: "bg-white pl-10",
                  }),
                  _jsx(Mail, {
                    className: "absolute left-3 top-3 h-4 w-4 text-gray-400",
                  }),
                ],
              }),
              errors.email &&
                _jsx("p", {
                  className: "text-sm text-red-500 mt-1",
                  children: errors.email,
                }),
            ],
          }),
          _jsx(Button, {
            type: "submit",
            className: "w-full",
            size: "lg",
            disabled: isSubmitting,
            children: isSubmitting ? "Enviando..." : "Enviar instrucciones",
          }),
        ],
      }),
      _jsx("div", {
        className: "mt-8 text-center",
        children: _jsxs(Link, {
          to: "/login",
          className:
            "inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors",
          children: [
            _jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Volver al inicio de sesi\u00F3n",
          ],
        }),
      }),
    ],
  });
};
