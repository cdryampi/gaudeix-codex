import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "../components/AuthCard";
import { useAuthForm } from "../hooks/useAuthForm";
import { LogIn } from "lucide-react";

const registerSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    repeat_password: z.string(),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: "Las contraseñas no coinciden",
    path: ["repeat_password"],
  });

export const RegisterPage = () => {
  const { values, errors, isSubmitting, handleChange, handleSubmit } =
    useAuthForm({
      schema: registerSchema,
      defaultValues: { email: "", password: "", repeat_password: "" },
      onSubmit: async () => {
        // Placeholder for actual register logic
      },
    });

  return (
    <AuthCard
      title="Crear Cuenta"
      subtitle="Únete a nosotros"
      footer={
        <Link
          to="/login"
          className="group flex items-center justify-center gap-2 text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-all duration-200 font-medium"
        >
          <LogIn className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>
            ¿Ya tienes cuenta?{" "}
            <span className="underline decoration-2 underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 group-hover:decoration-primary">
              Inicia sesión
            </span>
          </span>
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Correo electrónico
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={values.email}
            onChange={handleChange}
            className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1.5">{errors.email}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Contraseña
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={values.password}
            onChange={handleChange}
            className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
          />
          {errors.password && (
            <p className="text-sm text-destructive mt-1.5">{errors.password}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="repeat_password"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Confirmar Contraseña
          </Label>
          <Input
            id="repeat_password"
            name="repeat_password"
            type="password"
            placeholder="Repite tu contraseña"
            value={values.repeat_password}
            onChange={handleChange}
            className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
          />
          {errors.repeat_password && (
            <p className="text-sm text-destructive mt-1.5">
              {errors.repeat_password}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full h-10 sm:h-11 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Cargando..." : "Registrarse"}
        </Button>
      </form>
    </AuthCard>
  );
};
