import { useMemo, useState } from "react";
import {
  Languages,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Event } from "../types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGES } from "@/lib/config/constants";
// @ts-ignore - Shared component from frontend via Vite alias
import { EventDetailContent } from "@frontend/features/agenda/components/EventDetailContent";

interface EventPreviewProps {
  event: Event;
}

export function EventPreview({ event: initialEvent }: EventPreviewProps) {
  const [activeLang, setActiveLang] = useState("ca");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [simulationMsg, setSimulationMsg] = useState<string | null>(null);

  const showSimulation = (msg: string) => {
    setSimulationMsg(msg);
    setTimeout(() => setSimulationMsg(null), 2500);
  };

  const event = useMemo(() => {
    if (activeLang === "ca") return initialEvent;
    
    const trans = initialEvent.translations?.[activeLang];
    if (!trans) return initialEvent;

    return {
      ...initialEvent,
      title: trans.title || initialEvent.title,
      summary: trans.summary || initialEvent.summary,
      description: trans.description || initialEvent.description,
    };
  }, [initialEvent, activeLang]);

  return (
    <div className="flex flex-col h-full max-h-[90vh] bg-slate-100 rounded-xl overflow-hidden relative">
      {/* Simulation Toast */}
      {simulationMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold animate-pulse">
          {simulationMsg}
        </div>
      )}

      {/* Toolbar — shrink-0 keeps it fixed at top */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <Button
              variant={viewMode === "desktop" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-3"
              onClick={() => setViewMode("desktop")}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </Button>
            <Button
              variant={viewMode === "mobile" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-3"
              onClick={() => setViewMode("mobile")}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Languages className="h-4 w-4 mr-2" />
                {LANGUAGES.find((l) => l.code === activeLang)?.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setActiveLang(lang.code)}
                  className={cn(activeLang === lang.code && "bg-slate-100 font-bold")}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Preview Container — flex-1 + overflow-y-auto for independent scroll */}
      <div className="flex-1 overflow-y-auto p-6 flex justify-center">
        <div
          className={cn(
            "bg-white text-slate-900 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden",
            viewMode === "desktop" ? "w-full max-w-5xl rounded-xl" : "w-[375px] rounded-[3rem] border-[8px] border-slate-900 h-[700px] relative"
          )}
        >
          <div className={cn("h-full overflow-y-auto custom-scrollbar", viewMode === "mobile" && "px-1")}>
            <EventDetailContent
              event={event as any}
              isPreview
              onFavorite={() => showSimulation("Simulación: Evento añadido a favoritos ❤️")}
              onCheckin={() => showSimulation("Simulación: Check-in realizado (+20 pts)")}
              onShare={() => showSimulation("Simulación: Menú de compartir abierto")}
              onAddToCalendar={() => showSimulation("Simulación: Añadido al calendario 📅")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
