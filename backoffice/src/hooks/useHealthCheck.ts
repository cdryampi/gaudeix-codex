import { useEffect, useState } from "react";
import { API_CONFIG } from "@/lib/config/constants";

type BackendStatus = "online" | "offline" | "checking";
type DbStatus = "ok" | "error" | "unknown";

interface HealthCheckResponse {
  status: string;
  database?: string;
}

export function useHealthCheck() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [dbStatus, setDbStatus] = useState<DbStatus>("unknown");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthUrl = `${API_CONFIG.BASE_URL}/health/`;
        const response = await fetch(healthUrl);
        const data: HealthCheckResponse = await response.json();

        if (response.ok && data.status === "online") {
          setBackendStatus("online");
          setDbStatus(data.database === "ok" ? "ok" : "error");
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

  return { backendStatus, dbStatus };
}
