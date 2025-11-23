import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "../components/AuthCard";
import { useAuth } from "@/app/providers/AuthProvider";
import { ROUTES } from "@/lib/config/constants";
import { LogIn, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  username: z.string().min(1, "El usuario o email es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [loginError, setLoginError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (loginError) setLoginError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("📝 Form submitted", formData);
    setErrors({});
    setLoginError("");

    try {
      console.log("🔍 Validando datos del formulario...");
      const validatedData = loginSchema.parse(formData);
      console.log("✅ Datos validados:", { username: validatedData.username });

      console.log("🚀 Llamando a login...");
      await login(validatedData.username, validatedData.password);

      console.log("🎯 Navegando al dashboard...");
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error("❌ Error en handleSubmit:", error);
      if (error instanceof z.ZodError) {
        const formattedErrors: Partial<Record<keyof LoginFormData, string>> =
          {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        const message =
          error instanceof Error
            ? error.message
            : "Error al iniciar sesión. Verifica tus credenciales.";
        setLoginError(message);
      }
    }
  };

  return (
    <AuthCard title="Bienvenido" subtitle="Accede a tu cuenta">
      <form onSubmit={handleSubmit} className="space-y-4">
        {loginError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="username">Usuario o Email</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="usuario o email@ejemplo.com"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="username"
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            "Iniciando sesión..."
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar sesión
            </>
          )}
        </Button>

        {/* Debug info */}
        <div className="text-xs text-muted-foreground mt-2">
          <p>Username: {formData.username}</p>
          <p>Password: {formData.password ? "***" : "(vacío)"}</p>
          <p>isLoading: {isLoading ? "true" : "false"}</p>
        </div>
      </form>
    </AuthCard>
  );
};
