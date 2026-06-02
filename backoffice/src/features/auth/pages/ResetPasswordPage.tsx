import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthForm } from "../hooks/useAuthForm";
import { ArrowLeft } from "lucide-react";

const resetSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const ResetPasswordPage = () => {
  const { values, errors, isSubmitting, handleChange, handleSubmit } =
    useAuthForm({
      schema: resetSchema,
      defaultValues: { email: "" },
      onSubmit: async () => {
        // Placeholder for actual reset logic
        await new Promise((resolve) => setTimeout(resolve, 1000));
      },
    });

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Recuperar Contraseña
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Te enviaremos instrucciones a tu correo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
            Correo electrónico
          </Label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="nombre@ejemplo.com"
            value={values.email}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
          />
          {errors.email && (
            <p className="text-sm text-red-500 font-medium mt-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 rounded-xl font-semibold text-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
        </Button>
      </form>

      {/* Back to Login Link */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
        <Link
          to="/login"
          className="group inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver al inicio de sesión</span>
        </Link>
      </div>
    </div>
  );
};
