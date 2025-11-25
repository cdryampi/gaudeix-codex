import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/AuthProvider";
import { LogOut, HeartPulse, RefreshCcw } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HEALTH_CHECK_URL } from "@/lib/config/constants";
import { cn } from "@/lib/utils";

type Status = "activo" | "error" | "apagado";

export function Header() {
  const { logout } = useAuth();
  const [backendStatus, setBackendStatus] = useState<Status>("apagado");
  const [frontendStatus, setFrontendStatus] = useState<Status>("apagado");

  const pingFrontend = async () => {
    try {
      await fetch("/", { method: "HEAD" });
      setFrontendStatus("activo");
    } catch (err) {
      console.error("Ping frontend failed:", err);
      setFrontendStatus("error");
    }
  };

  const pingBackend = async () => {
    try {
      const response = await fetch(HEALTH_CHECK_URL);
      const data = await response.json();
      if (response.ok && data.status === "online") {
        setBackendStatus("activo");
      } else {
        setBackendStatus("error");
      }
    } catch (err) {
      console.error("Ping backend failed:", err);
      setBackendStatus("error");
    }
  };

  useEffect(() => {
    pingFrontend();
    pingBackend();
  }, []);

  const backofficeStatus: Status = "activo";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6 dark:bg-slate-900/80">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Dashboard
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-border/50 bg-white/60 px-2 py-1 dark:bg-slate-900/60">
          <StatusCard label="Frontend" status={frontendStatus} />
          <StatusCard label="Backend" status={backendStatus} />
          <StatusCard label="Backoffice" status={backofficeStatus} />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground shrink-0"
            onClick={() => {
              pingFrontend();
              pingBackend();
            }}
            aria-label="Refrescar estado"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <ThemeToggle />
        <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
}

type BadgesProps = {
  backend: Status;
  frontend: Status;
  backoffice: Status;
  onRefresh: () => void;
};

function StatusCard({ label, status }: { label: string; status: Status }) {
  const paletteClasses: Record<Status, string> = {
    activo:
      "!bg-emerald-100/80 !text-emerald-800 !border-emerald-300 dark:!bg-emerald-900/40 dark:!text-emerald-100 dark:!border-emerald-800",
    error:
      "!bg-rose-100/80 !text-rose-800 !border-rose-300 dark:!bg-rose-900/40 dark:!text-rose-100 dark:!border-rose-800",
    apagado:
      "!bg-slate-100/80 !text-slate-700 !border-slate-300 dark:!bg-slate-800 dark:!text-slate-200 dark:!border-slate-700",
  };

  const iconClasses: Record<Status, string> = {
    activo: "!text-emerald-700 dark:!text-emerald-200",
    error: "!text-rose-700 dark:!text-rose-200",
    apagado: "!text-slate-600 dark:!text-slate-300",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
        paletteClasses[status]
      )}
    >
      <HeartPulse className={cn("h-4 w-4 animate-pulse", iconClasses[status])} />
      <span>{label}</span>
      <span className="text-[10px] uppercase tracking-wide">
        {status === "activo" ? "Activo" : status === "error" ? "Error" : "Apagado"}
      </span>
    </div>
  );
}
