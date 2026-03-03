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

import { ROUTES } from "@/lib/config/constants";
import {
  Activity,
  Server,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useHealthCheck } from "@/hooks/useHealthCheck";

/**
 * Landing Page - Entry point for the backoffice
 * Shows system status and provides quick access to login
 */
export function LandingPage() {
  const { backendStatus, dbStatus } = useHealthCheck();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header />

      {/* Main content - Vertically Centered */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="container mx-auto flex flex-col items-center justify-center space-y-12 max-w-5xl">
          {/* Hero section */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            {/* Badge with better padding */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium shadow-sm mx-auto">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Sistema de Gestión Municipal</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Panel de Administración
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Gestiona tu contenido municipal de forma centralizada, eficiente
                y segura
              </p>
            </div>
          </div>

          {/* Status cards - Grid Centered */}
          <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {/* Frontend Card */}
            <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge
                    variant="outline"
                    className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                  >
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Online
                  </Badge>
                </div>
                <div className="space-y-1 pt-2">
                  <CardTitle className="text-lg">Frontend</CardTitle>
                  <CardDescription className="text-sm">
                    Sitio público activo
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Zap className="mr-1.5 h-3.5 w-3.5" />
                  <span>localhost:5173</span>
                </div>
              </CardContent>
            </Card>

            {/* Backend Card */}
            <Card
              className={`group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all ${
                backendStatus === "online"
                  ? "hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10"
                  : backendStatus === "checking"
                    ? "hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10"
                    : "hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10"
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100 ${
                  backendStatus === "online"
                    ? "from-green-500/5"
                    : backendStatus === "checking"
                      ? "from-yellow-500/5"
                      : "from-red-500/5"
                } to-transparent`}
              />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`rounded-lg p-2 ${
                      backendStatus === "online"
                        ? "bg-green-500/10"
                        : backendStatus === "checking"
                          ? "bg-yellow-500/10"
                          : "bg-red-500/10"
                    }`}
                  >
                    <Server
                      className={`h-5 w-5 ${
                        backendStatus === "online"
                          ? "text-green-600 dark:text-green-400"
                          : backendStatus === "checking"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    />
                  </div>
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
                      <span className="relative flex h-2 w-2 mr-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
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
                <div className="space-y-1 pt-2">
                  <CardTitle className="text-lg">Backend</CardTitle>
                  <CardDescription className="text-sm">
                    API & Base de datos
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Django API</span>
                    <span
                      className={`font-medium ${
                        backendStatus === "online"
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {backendStatus === "online" ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">PostgreSQL</span>
                    <span
                      className={`font-medium ${
                        dbStatus === "ok"
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {dbStatus === "ok" ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backoffice Card */}
            <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 sm:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/10 text-primary"
                  >
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Activo
                  </Badge>
                </div>
                <div className="space-y-1 pt-2">
                  <CardTitle className="text-lg">Backoffice</CardTitle>
                  <CardDescription className="text-sm">
                    Panel administrativo
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Zap className="mr-1.5 h-3.5 w-3.5" />
                  <span>Sistema de gestión</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions - Centered */}
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row w-full pt-4">
            <Button
              asChild
              size="lg"
              className="group w-full sm:w-auto min-w-[240px] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Link to={ROUTES.LOGIN}>
                <ShieldCheck className="mr-2 h-5 w-5" />
                Acceder al Backoffice
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="group w-full sm:w-auto min-w-[240px] border-border/50 hover:border-primary/30 transition-all"
            >
              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Ver Frontend Público
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50 backdrop-blur">
        <div className="container flex h-14 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Gaudeix Municipal · Sistema de gestión
          </p>
        </div>
      </footer>
    </div>
  );
}
