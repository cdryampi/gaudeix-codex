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
import { ROUTES, API_CONFIG } from "@/lib/config/constants";
import { Activity, Server, ShieldCheck, ArrowRight } from "lucide-react";
import { useHealthCheck } from "@/hooks/useHealthCheck";

export function LandingPage() {
  const { backendStatus, dbStatus } = useHealthCheck();

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-900 rounded-2xl p-6 shadow-lg transition-transform duration-300 hover:scale-105">
              <img
                src="/assets/img/logo-cabrera-white.png"
                alt="Gaudeix Codex Logo"
                className="h-20 w-auto"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Gaudeix Codex
          </h1>
          <p className="text-lg leading-8 text-gray-200">
            Sistema de Gestión y Administración
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Frontend Card */}
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Frontend</CardTitle>
                <Activity className="h-5 w-5 text-green-400" />
              </div>
              <CardDescription className="text-gray-200">
                Sitio Público
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge
                variant="outline"
                className="bg-green-500/20 text-green-100 border-green-400"
              >
                Online
              </Badge>
            </CardContent>
          </Card>

          {/* Backend Card */}
          <Card
            className={`bg-white/20 backdrop-blur-sm ${
              backendStatus === "online"
                ? "border-green-500"
                : backendStatus === "checking"
                ? "border-yellow-500"
                : "border-red-500"
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Backend</CardTitle>
                <Server
                  className={`h-5 w-5 ${
                    backendStatus === "online"
                      ? "text-green-400"
                      : backendStatus === "checking"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                />
              </div>
              <CardDescription className="text-gray-200">
                API & Database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">API:</span>
                  {backendStatus === "checking" ? (
                    <Badge
                      variant="outline"
                      className="bg-yellow-500/20 text-yellow-100 border-yellow-400"
                    >
                      Verificando...
                    </Badge>
                  ) : backendStatus === "online" ? (
                    <Badge
                      variant="outline"
                      className="bg-green-500/20 text-green-100 border-green-400"
                    >
                      Online
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-red-500/20 text-red-100 border-red-400"
                    >
                      Offline
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Base de datos:</span>
                  {dbStatus === "ok" ? (
                    <span className="text-sm font-medium text-green-400">
                      Conectada
                    </span>
                  ) : dbStatus === "error" ? (
                    <span className="text-sm font-medium text-red-400">
                      Error
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 pt-2 border-t border-white/10 mt-2">
                  {API_CONFIG.BASE_URL}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backoffice Card */}
          <Card className="bg-white/20 backdrop-blur-sm border-white/30 md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Backoffice</CardTitle>
                <ShieldCheck className="h-5 w-5 text-blue-400" />
              </div>
              <CardDescription className="text-gray-200">
                Panel de Administración
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge
                variant="outline"
                className="bg-blue-500/20 text-blue-100 border-blue-400"
              >
                Activo
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Login button */}
        <div className="flex justify-center pt-6">
          <Button
            asChild
            size="lg"
            className="group bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all"
          >
            <Link to={ROUTES.LOGIN}>
              <ShieldCheck className="mr-2 h-5 w-5" />
              Acceder al Backoffice
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
