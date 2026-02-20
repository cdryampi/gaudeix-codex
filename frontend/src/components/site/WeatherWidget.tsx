import {
  CloudSun,
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  Snowflake,
} from "lucide-react";
import { SiteSettings } from "@/features/site-settings/types";

interface WeatherWidgetProps {
  weather: SiteSettings["current_weather"];
}

export function WeatherWidget({ weather }: WeatherWidgetProps) {
  if (!weather) return null;

  // Map WMO weather codes to icons
  // https://open-meteo.com/en/docs
  const getIcon = (code: number) => {
    if (code === 0) return <Sun className="h-4 w-4 text-amber-400" />;
    if (code >= 1 && code <= 3)
      return <CloudSun className="h-4 w-4 text-amber-200" />;
    if (code >= 45 && code <= 48)
      return <Cloud className="h-4 w-4 text-slate-300" />;
    if (code >= 51 && code <= 67)
      return <CloudRain className="h-4 w-4 text-blue-300" />;
    if (code >= 71 && code <= 77)
      return <Snowflake className="h-4 w-4 text-white" />;
    if (code >= 80 && code <= 82)
      return <CloudRain className="h-4 w-4 text-blue-400" />;
    if (code >= 95)
      return <CloudLightning className="h-4 w-4 text-amber-500" />;
    return <CloudSun className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/5 shadow-sm">
      <div className="flex items-center justify-center">
        {getIcon(weather.weather_code)}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[11px] font-black text-white tracking-tighter">
          {Math.round(weather.tempmax)}°
        </span>
        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">
          Cabrera
        </span>
      </div>
    </div>
  );
}
