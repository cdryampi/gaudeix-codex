import { useEffect, useState } from "react";
import { HEALTH_CHECK_URL } from "@/lib/config/constants";
export function useHealthCheck() {
    const [backendStatus, setBackendStatus] = useState("checking");
    const [dbStatus, setDbStatus] = useState("unknown");
    useEffect(() => {
        const checkHealth = async () => {
            try {
                const healthUrl = HEALTH_CHECK_URL;
                const response = await fetch(healthUrl);
                const data = await response.json();
                if (response.ok && data.status === "online") {
                    setBackendStatus("online");
                    setDbStatus(data.database === "ok" ? "ok" : "error");
                }
                else {
                    setBackendStatus("offline");
                }
            }
            catch (error) {
                console.error("Health check failed:", error);
                setBackendStatus("offline");
            }
        };
        checkHealth();
    }, []);
    return { backendStatus, dbStatus };
}
