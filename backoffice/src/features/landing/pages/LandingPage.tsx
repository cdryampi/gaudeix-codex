import { useEffect, useState } from "react";
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

export function LandingPage() {
  /* ---------- Estado ---------- */
  const [backendStatus, setBackendStatus] = useState<
    "online" | "offline" | "checking"
  >("checking");
  const [dbStatus, setDbStatus] = useState<"ok" | "error" | "unknown">(
    "unknown"
  );

  /* ---------- Health check ---------- */
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_HEALTH_CHECK_URL);
        const data = await response.json();
        if (response.ok && data.status === "online") {
          setBackendStatus("online");
          setDbStatus(data.database || "unknown");
        } else {
          setBackendStatus("offline");
        }
      } catch (error) {
        console.error("Health check failed:", error);
        setBackendStatus("offline");
      }
    };
    checkHealth();
  }, []);

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-6">
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
          <Card className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-white">
                  Frontend
                </CardTitle>
                <Activity className="h-5 w-5 text-green-400" />
              </div>
              <CardDescription className="text-gray-200">
                Frontend Service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  Online
                </Badge>
                <span className="text-sm text-gray-300">v1.0.0</span>
              </div>
            </CardContent>
          </Card>

          {/* Backend Card */}
          <Card
            className={`bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-md ${
              backendStatus === "online"
                ? "border-green-500"
                : backendStatus === "checking"
                ? "border-yellow-500"
                : "border-red-500"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-white">
                  Backend
                </CardTitle>
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
                {/* API status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">API Status:</span>
                  {backendStatus === "checking" ? (
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                      Checking...
                    </Badge>
                  ) : backendStatus === "online" ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Online
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200"
                    >
                      Offline
                    </Badge>
                  )}
                </div>

                {/* Database status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Database:</span>
                  {dbStatus === "ok" ? (
                    <span className="text-sm font-medium text-green-400">
                      Connected
                    </span>
                  ) : dbStatus === "error" ? (
                    <span className="text-sm font-medium text-red-400">
                      Error
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </div>

                {/* Base URL */}
                <div className="text-xs text-gray-300 pt-2 border-t mt-2">
                  {API_CONFIG.BASE_URL}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backoffice Card */}
          <Card className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-white">
                  Backoffice
                </CardTitle>
                <ShieldCheck className="h-5 w-5 text-blue-400" />
              </div>
              <CardDescription className="text-gray-200">
                Backoffice Interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  Running
                </Badge>
                <a
                  href={import.meta.env.VITE_FRONTEND_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 underline"
                >
                  {import.meta.env.VITE_FRONTEND_URL}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Login button */}
        <div className="flex justify-center pt-8">
          <Link to={ROUTES.LOGIN}>
            <Button
              size="lg"
              className="group bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-colors"
            >
              <ShieldCheck className="mr-2 h-5 w-5" />
              Acceder al Backoffice
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
