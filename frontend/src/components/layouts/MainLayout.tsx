import { ReactNode, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { apiGet } from "@/lib/api";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [settings, setSettings] = useState<{
    site_name: string;
    tagline: string;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const site = await apiGet<{ site_name: string; tagline: string }>(
          "/site-settings/",
        );
        setSettings(site);
      } catch (err) {
        console.warn("API not available for settings.", err);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-accent selection:text-slate-950">
      <SiteHeader siteName={settings?.site_name} />
      <main className="relative">{children}</main>
      <SiteFooter />
    </div>
  );
}
