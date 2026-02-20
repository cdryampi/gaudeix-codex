import { ReactNode, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteTopbar } from "@/components/site/SiteTopbar";
import { useLocation } from "react-router-dom";
import { apiGet } from "@/lib/api";
import { SiteSettings } from "@/features/site-settings/types";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  const isHeroPage =
    pathname === "/" ||
    pathname.startsWith("/agenda/") ||
    pathname.startsWith("/lugares/") ||
    pathname.startsWith("/noticias/");
  const isTransparent = isHeroPage && !scrolled;

  useEffect(() => {
    const load = async () => {
      try {
        const site = await apiGet<SiteSettings>("/site-settings/");
        setSettings(site);
      } catch (err) {
        console.warn("API not available for settings.", err);
      }
    };
    load();

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-accent selection:text-slate-950">
      {/* GLOBAL HEADER WRAPPER */}
      <div className="fixed top-0 z-[1000] w-full">
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${scrolled ? "h-0 opacity-0" : "h-12 opacity-100"}`}
        >
          <SiteTopbar isTransparent={isTransparent} />
        </div>
        <SiteHeader
          siteName={settings?.site_name}
          isTransparent={isTransparent}
        />
      </div>

      <main className="relative">{children}</main>
      <SiteFooter />
    </div>
  );
}
