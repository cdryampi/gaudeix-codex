import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

    setErrors({});
    setLoginError("");

    try {
      const validatedData = loginSchema.parse(formData);
      await login(validatedData.username, validatedData.password);
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
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
        const message = error instanceof Error ? error.message : null;
        setLoginError(
          message ?? "Error al iniciar sesión. Verifica tus credenciales."
        );
      }
    }
  };

  return (
    <AuthCard title="Bienvenido" subtitle="Accede a tu cuenta">
      <div className="mx-auto w-full max-w-[520px] space-y-5 sm:space-y-6">
        <div className="space-y-2 text-center">
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15"
          >
            Acceso seguro
          </Badge>
          <p className="text-sm text-muted-foreground">
            Usa tus credenciales para entrar al panel
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-5 text-left px-10"
          autoComplete="on"
        >
          {loginError && (
            <Alert variant="destructive" className="!border-red-500/40">
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
              className="h-11 bg-background/80 !border border-border focus-visible:ring-2 focus-visible:ring-primary/50 w-full max-w-full"
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
              className="h-11 bg-background/80 !border border-border focus-visible:ring-2 focus-visible:ring-primary/50 w-full max-w-full"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>¿Olvidaste tu contraseña?</span>
            <Link
              to="/reset-password"
              className="font-medium text-primary hover:underline"
            >
              Recuperar acceso
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium !bg-primary text-primary-foreground hover:!bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              "Iniciando sesión..."
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar sesión
              </>
            )}
          </Button>
        </form>
      </div>
    </AuthCard>
  );
};
