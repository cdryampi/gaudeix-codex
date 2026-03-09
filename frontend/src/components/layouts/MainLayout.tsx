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
