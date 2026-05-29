import { useState, useEffect } from "react";
import apiConfig from "./config/api";
import { CabritaPremiumMaintenance } from "@frontend/components/feedback/CabritaPremiumMaintenance";

function App() {
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    const runHealthCheck = async () => {
      const baseUrl = apiConfig.baseUrl || "http://localhost:8000/api/v1";
      try {
        const resp = await fetch(`${baseUrl}/categories/`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (!resp.ok && (resp.status === 503 || resp.status === 502)) {
          setIsMaintenance(true);
        }
      } catch {
        // Error de red (backend caído)
        setIsMaintenance(true);
      }
    };

    void runHealthCheck();
  }, []);

  if (isMaintenance) {
    return <CabritaPremiumMaintenance />;
  }

  return (
    <main className="card">
      <h1>Gaudeix Backoffice</h1>
      <p>Panel administrativo listo para conectar con la API del backend.</p>
      <p>
        API Base URL: <code>{apiConfig.baseUrl ?? "not set"}</code>
      </p>
      <p className="read-the-docs">
        Extiende este contenedor con vistas, listas y formularios de
        administración.
      </p>
    </main>
  );
}

export default App;
