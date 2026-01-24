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
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.PASSWORD_RESET}`
        );
        // Placeholder for actual reset logic
      },
    });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Recuperar Contraseña
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Te enviaremos instrucciones a tu correo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-gray-700 dark:text-gray-300"
          >
            Correo electrónico
          </Label>
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              value={values.email}
              onChange={handleChange}
              className="bg-white pl-10"
            />
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
};
