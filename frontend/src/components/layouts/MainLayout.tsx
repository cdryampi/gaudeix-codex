import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteTopbar } from "@/components/site/SiteTopbar";
import { FestaAnnouncementBar } from "@/components/site/FestaAnnouncementBar";
import { apiGet } from "@/lib/api";
import { SiteSettings } from "@/features/site-settings/types";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const load = async () => {
      try {
        const site = await apiGet<SiteSettings>("/site-settings/");
        setSettings(site);
      } catch (err) {
        console.warn("API not available for settings.", err);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    if (settings && settings.theme_config) {
      const root = document.documentElement;
      const theme = settings.theme_config;

      if (theme.primary) root.style.setProperty("--primary", theme.primary);
      if (theme.secondary)
        root.style.setProperty("--secondary", theme.secondary);
      if (theme.accent) root.style.setProperty("--accent", theme.accent);
      if (theme.background_light)
        root.style.setProperty("--background-light", theme.background_light);
      if (theme.background_dark)
        root.style.setProperty("--background-dark", theme.background_dark);
      if (theme.surface) root.style.setProperty("--surface", theme.surface);
      if (theme.surface_muted)
        root.style.setProperty("--surface-muted", theme.surface_muted);
      if (theme.text_primary)
        root.style.setProperty("--text-primary", theme.text_primary);
      if (theme.text_secondary)
        root.style.setProperty("--text-secondary", theme.text_secondary);

      if (theme.radius_scale !== undefined) {
        root.style.setProperty("--radius-scale", String(theme.radius_scale));
      }

      if (theme.shadow_preset) {
        const shadowMap = {
          none: "none",
          sm: "0 1px 3px rgba(0,0,0,0.05)",
          md: "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)",
          lg: "0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        };
        root.style.setProperty(
          "--shadow-active",
          shadowMap[theme.shadow_preset],
        );
      }
    }
  }, [settings]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > (isHome ? 48 : 8));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const shellTransparent = isHome && !isScrolled;

  return (
    <div className="min-h-screen bg-background-light text-slate-900 selection:bg-accent selection:text-slate-950">
      <div className="floating-shell">
        <FestaAnnouncementBar />
        <SiteTopbar isTransparent={shellTransparent} />
        <SiteHeader
          siteName={settings?.site_name}
          isTransparent={shellTransparent}
          isCondensed={isScrolled}
        />
      </div>

      <main className="relative">{children}</main>
      <SiteFooter />
    </div>
  );
}
