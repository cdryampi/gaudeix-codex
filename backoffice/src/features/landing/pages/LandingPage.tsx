import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ROUTES } from "@/lib/config/constants";
import { Activity, Server, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
import { useHealthCheck } from "@/hooks/useHealthCheck";

/**
 * Landing Page - Entry point for the backoffice
 * Shows system status and provides quick access to login
 */
export function LandingPage() {
  const { backendStatus, dbStatus } = useHealthCheck();

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header centrado con espacio alrededor */}
      <header className="mx-auto w-full max-w-6xl px-6 py-4">
        <div className="flex items-center justify-around">
          <div className="flex items-center gap-3">
            <img
              src="/assets/img/logo-cabrera-white.png"
              alt="Gaudeix"
              className="h-8 w-auto invert dark:invert-0"
            />
            <div>
              <h1 className="text-sm font-semibold">Gaudeix</h1>
              <p className="text-xs text-muted-foreground">Backoffice</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-4xl space-y-8">
          {/* Hero section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Panel de Administración
            </h2>
            <p className="text-lg text-muted-foreground">
              Sistema de gestión de contenido municipal
            </p>
          </div>

          {/* Status cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Frontend Card */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Frontend</CardTitle>
                  <Activity className="h-5 w-5 text-green-500" />
                </div>
                <CardDescription className="text-xs">
                  Sitio público
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge
                  variant="outline"
                  className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                >
                  Online
                </Badge>
              </CardContent>
            </Card>

            {/* Backend Card */}
            <Card
              className={`border-border bg-card shadow-sm ${
                backendStatus === "online"
                  ? ""
                  : backendStatus === "checking"
                  ? "border-yellow-500/30"
                  : "border-red-500/30"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Backend</CardTitle>
                  <Server
                    className={`h-5 w-5 ${
                      backendStatus === "online"
                        ? "text-green-500"
                        : backendStatus === "checking"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  />
                </div>
                <CardDescription className="text-xs">
                  API & Base de datos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API:</span>
                  {backendStatus === "checking" ? (
                    <Badge
                      variant="outline"
                      className="border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                    >
                      Verificando...
                    </Badge>
                  ) : backendStatus === "online" ? (
                    <Badge
                      variant="outline"
                      className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                    >
                      Online
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
                    >
                      Offline
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Base de datos:</span>
                  {dbStatus === "ok" ? (
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Conectada
                    </span>
                  ) : dbStatus === "error" ? (
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      Error
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Backoffice Card */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Backoffice</CardTitle>
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <CardDescription className="text-xs">
                  Panel administrativo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 text-primary"
                >
                  Activo
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="group min-w-[200px]"
            >
              <Link to={ROUTES.LOGIN}>
                <ShieldCheck className="mr-2 h-5 w-5" />
                Acceder al Backoffice
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="group min-w-[200px]"
            >
              <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-5 w-5" />
                Ver Frontend Público
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-4">
        <p className="text-center text-xs text-muted-foreground">
          © 2025 Gaudeix Municipal · Sistema de gestión
        </p>
      </footer>
    </div>
  );
}
