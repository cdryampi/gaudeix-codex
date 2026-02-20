import { Phone, Mail, Globe, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSiteSettings } from "@/features/site-settings/api";
import { SocialMediaBar } from "@/features/social/components/SocialMediaBar";
import { WeatherWidget } from "./WeatherWidget";

interface SiteTopbarProps {
  isTransparent?: boolean;
}

export const SiteTopbar = ({ isTransparent }: SiteTopbarProps) => {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
  });

  const hasAlert = settings?.is_alert_active;

  return (
    <div
      className={`h-12 w-full transition-all duration-500 flex items-center border-b ${
        isTransparent
          ? "bg-black/20 backdrop-blur-md border-white/10 text-white/70"
          : "bg-slate-900 border-slate-800 text-slate-400"
      }`}
    >
      <div className="container mx-auto px-8 flex items-center justify-between gap-6">
        {/* LEFT: Contact Info */}
        <div className="hidden lg:flex items-center gap-6 shrink-0">
          {settings?.phone && (
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              <Phone className="h-3 w-3 text-primary" />
              {settings.phone}
            </a>
          )}
          {settings?.contact_email && (
            <a
              href={`mailto:${settings.contact_email}`}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              <Mail className="h-3 w-3 text-primary" />
              {settings.contact_email}
            </a>
          )}
        </div>

        {/* CENTER: Weather or Alert */}
        <div className="flex-1 flex justify-center overflow-hidden">
          {hasAlert ? (
            <div className="flex items-center gap-3 animate-in slide-in-from-top duration-700">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-slate-900">
                <AlertTriangle className="h-3 w-3" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white truncate max-w-[300px] md:max-w-none">
                {settings.alert_message}
              </p>
              {settings.alert_link && (
                <a
                  href={settings.alert_link}
                  className="text-[8px] font-black uppercase tracking-widest underline decoration-accent underline-offset-4 hover:text-accent transition-colors"
                >
                  Saber más
                </a>
              )}
            </div>
          ) : (
            <WeatherWidget weather={settings?.current_weather} />
          )}
        </div>

        {/* RIGHT: Language & Social */}
        <div className="flex items-center gap-8 shrink-0">
          <SocialMediaBar scrolled={true} />
          <div className="flex items-center gap-3 border-l border-white/10 pl-8">
            <button className="text-[9px] font-black text-white">ES</button>
            <button className="text-[9px] font-black text-white/40 hover:text-white transition-colors">
              CA
            </button>
            <button className="text-[9px] font-black text-white/40 hover:text-white transition-colors">
              EN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
