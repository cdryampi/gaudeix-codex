import { useState } from "react";
import {
  ChevronDown,
  Heart,
  LogIn,
  Menu,
  Navigation,
  User,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { HEADER_NAV, type HeaderNavItem } from "@/data/headerNav";
import { useAuthStore } from "@/features/auth/store";
import { useLanguageStore } from "@/features/site-settings/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import {
  getHeaderMenuTree,
  type MenuTreeItem,
} from "@/features/site-settings/api/menuApi";
import logoCabrera from "@/assets/logo/logo-cabrera-white.png";
import { ThemeToggle } from "@/components/site/ThemeToggle";

function resolveUrl(item: MenuTreeItem): string {
  if (item.type === "category" && item.category?.slug) {
    return `/categorias/${item.category.slug}`;
  }
  if (item.type === "static_page" && item.static_page?.slug) {
    return `/paginas/${item.static_page.slug}`;
  }
  return item.url || "#";
}

function resolveLabel(item: MenuTreeItem): string {
  if (item.type === "category" && item.category?.nombre) {
    return item.category.nombre;
  }
  if (item.type === "static_page" && item.static_page?.titulo) {
    return item.static_page.titulo;
  }
  return item.label || "";
}

function toHeaderNavItems(items: MenuTreeItem[]): HeaderNavItem[] {
  return items.map((item) => ({
    label: resolveLabel(item),
    href: resolveUrl(item),
    children: item.children?.length
      ? toHeaderNavItems(item.children)
      : undefined,
  }));
}

export function SiteHeader({
  siteName = "Cabrera de Mar",
  isTransparent = false,
  isCondensed = false,
}: {
  siteName?: string;
  isTransparent?: boolean;
  isCondensed?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const queryClient = useQueryClient();
  const { setLanguage } = useLanguageStore();
  const { t, language } = useTranslation();

  const handleLanguageChange = (lang: "ca" | "es") => {
    if (language !== lang) {
      setLanguage(lang);
      void queryClient.invalidateQueries();
    }
  };

  const { data: apiMenuTree } = useQuery({
    queryKey: ["header-menu-tree"],
    queryFn: getHeaderMenuTree,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const navItems: HeaderNavItem[] =
    apiMenuTree && apiMenuTree.length > 0
      ? toHeaderNavItems(apiMenuTree)
      : HEADER_NAV;

  return (
    <>
      <header
        id="site-header"
        className={`relative z-30 w-full transition-all duration-500 ${
          isTransparent
            ? "border-b border-transparent bg-transparent text-white"
            : "border-b border-border-soft bg-surface/95 backdrop-blur-md shadow-sm"
        }`}
      >
        <div
          className={`page-container flex items-center justify-between gap-4 transition-all duration-500 ${
            isCondensed ? "h-14" : "h-16 md:h-20"
          }`}
        >
          <Link
            to="/"
            id="header-logo-link"
            className="flex shrink-0 items-center group"
          >
            <div className="transition-transform duration-300 group-hover:scale-105">
              <img
                src={logoCabrera}
                alt={siteName}
                className={`w-auto object-contain transition-all duration-500 ${isCondensed ? "h-7 md:h-8" : "h-8 md:h-10"} ${isTransparent ? "brightness-[100]" : "brightness-0"}`}
              />
            </div>
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Navegación principal"
          >
            {navItems.map((item) => (
              <div key={item.label} className="group relative">
                <Link
                  to={item.href || "#"}
                  id={`nav-item-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    isTransparent
                      ? "text-white/60 hover:bg-white/5 hover:text-white"
                      : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                  }`}
                >
                  {t(item.label)}
                  {item.children ? (
                    <ChevronDown className="h-3.5 w-3.5 opacity-40 transition-transform duration-300 group-hover:rotate-180" />
                  ) : null}
                </Link>

                {item.children ? (
                  <div className="invisible absolute left-0 top-full z-50 translate-y-1 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="min-w-[240px] overflow-hidden rounded-2xl border border-border-soft bg-surface p-2 shadow-[0_18px_44px_rgba(17,37,53,0.14)]">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href || "#"}
                          id={`nav-child-${child.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-text-secondary transition-all hover:bg-surface-muted hover:text-primary"
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary/25" />
                          {t(child.label)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle
              isTransparent={isTransparent}
              id="header-theme-toggle"
            />
            <Link
              to="/como-llegar"
              id="btn-header-como-llegar"
              className={`hidden items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all md:flex ${
                isTransparent
                  ? "bg-white/10 text-white hover:bg-white/20 hover:scale-[1.02]"
                  : "bg-surface-muted text-text-primary hover:bg-surface-muted/80"
              }`}
            >
              <Navigation className="h-3.5 w-3.5 opacity-80" />
              {t("Cómo llegar")}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/mis-favoritos"
                  id="btn-header-favoritos"
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    isTransparent
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                  }`}
                  title={t("Mis Favoritos")}
                >
                  <Heart
                    className={`h-4 w-4 ${isTransparent ? "text-white" : "text-rose-500"}`}
                  />
                </Link>
                <div className="hidden items-center gap-2 md:flex">
                  <div
                    id="header-user-menu"
                    className={`group relative flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full px-3.5 transition-all ${
                      isTransparent
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-surface-muted text-text-primary"
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {user?.username}
                    </span>

                    <div className="invisible absolute right-0 top-full mt-2 translate-y-1 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="overflow-hidden rounded-xl border border-border-soft bg-surface p-1.5 shadow-xl">
                        <Link
                          to="/mis-favoritos"
                          id="header-user-favoritos"
                          className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-text-primary hover:bg-surface-muted"
                        >
                          <Heart className="h-3.5 w-3.5 text-rose-500" />
                          {t("Favoritos")}
                        </Link>
                        <button
                          onClick={() => logout()}
                          id="btn-header-logout"
                          className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left"
                        >
                          <LogIn className="h-3.5 w-3.5 rotate-180" />
                          {t("Cerrar sesión")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                id="btn-header-login"
                className={`hidden h-9 items-center gap-2 rounded-full px-5 text-xs font-bold transition-all md:flex hover:scale-[1.02] ${
                  isTransparent
                    ? "bg-white text-slate-900 shadow-xl"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                <LogIn className="h-3.5 w-3.5" />
                {t("Entrar")}
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              id="btn-mobile-menu-open"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all lg:hidden ${
                isTransparent
                  ? "bg-white/10 text-white hover:bg-white/16"
                  : "bg-surface-muted text-text-primary hover:bg-surface-muted/80"
              }`}
              aria-label={t("Abrir menú")}
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[100] lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            id="mobile-menu-overlay"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />

          <div className="absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-surface shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex h-20 items-center justify-between border-b border-border-soft px-8">
              <div className="flex items-center gap-4">
                <img
                  src={logoCabrera}
                  alt={siteName}
                  className="h-7 w-auto brightness-0"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    Cabrera de Mar
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                id="btn-mobile-menu-close"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted transition-all hover:bg-surface-muted/80 active:scale-95"
                aria-label={t("Cerrar menu")}
              >
                <X className="h-6 w-6 text-text-primary" />
              </button>
            </div>

            <nav
              className="flex-1 overflow-y-auto px-2 py-6"
              aria-label={t("Navegación móvil")}
            >
              <div className="space-y-1">
                {navItems.map((item) => (
                  <div key={item.label} className="overflow-hidden rounded-2xl">
                    {item.children ? (
                      <>
                        <button
                          id={`btn-mobile-nav-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                          onClick={() =>
                            setMobileExpanded(
                              mobileExpanded === item.label ? null : item.label,
                            )
                          }
                          className={`flex w-full items-center justify-between px-6 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${mobileExpanded === item.label ? "bg-surface-muted text-primary" : "text-text-primary hover:bg-surface-muted"}`}
                        >
                          {t(item.label)}
                          <ChevronDown
                            className={`h-4 w-4 text-text-secondary/60 transition-transform duration-300 ${
                              mobileExpanded === item.label ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {mobileExpanded === item.label ? (
                          <div className="bg-surface-muted/40 py-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.label}
                                to={child.href || "#"}
                                id={`link-mobile-child-${child.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-10 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-text-secondary transition-colors hover:text-primary"
                              >
                                {t(child.label)}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <Link
                        to={item.href || "#"}
                        id={`link-mobile-nav-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center px-6 py-4 text-sm font-bold uppercase tracking-widest text-text-primary transition-colors hover:bg-surface-muted"
                      >
                        {t(item.label)}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </nav>

            <div className="space-y-4 border-t border-border-soft p-8 bg-surface-muted/30">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  <button
                    id="btn-mobile-lang-es"
                    onClick={() => handleLanguageChange("es")}
                    className={`text-[11px] font-bold tracking-widest cursor-pointer transition-colors ${
                      language === "es"
                        ? "text-text-primary font-black scale-105"
                        : "text-text-secondary/60 hover:text-text-primary"
                    }`}
                  >
                    ES
                  </button>
                  <div className="h-4 w-px bg-border-soft" />
                  <button
                    id="btn-mobile-lang-ca"
                    onClick={() => handleLanguageChange("ca")}
                    className={`text-[11px] font-bold tracking-widest cursor-pointer transition-colors ${
                      language === "ca"
                        ? "text-text-primary font-black scale-105"
                        : "text-text-secondary/60 hover:text-text-primary"
                    }`}
                  >
                    CA
                  </button>
                </div>
                <ThemeToggle id="mobile-theme-toggle" />
              </div>

              <Link
                to="/como-llegar"
                id="btn-mobile-como-llegar"
                onClick={() => setMobileOpen(false)}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-transform"
              >
                <Navigation className="h-4 w-4" />
                {t("Cómo llegar")}
              </Link>

              {!isAuthenticated ? (
                <Link
                  to="/login"
                  id="btn-mobile-login"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border-soft bg-surface text-[11px] font-black uppercase tracking-[0.2em] text-text-primary transition-all active:scale-[0.98]"
                >
                  <LogIn className="h-4 w-4" />
                  {t("Entrar")}
                </Link>
              ) : null}
            </div>

            {isAuthenticated ? (
              <div className="mt-4 space-y-3 px-8 pb-8">
                <div className="flex items-center gap-3 rounded-2xl bg-surface px-5 py-4 ring-1 ring-border-soft">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-text-primary">
                    {user?.username}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/mis-favoritos"
                    id="btn-mobile-favoritos"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-50 text-[10px] font-bold uppercase tracking-widest text-rose-500"
                  >
                    <Heart className="h-3.5 w-3.5" />
                    {t("Favoritos")}
                  </Link>
                  <button
                    id="btn-mobile-logout"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="h-12 flex-1 rounded-2xl bg-red-50 text-[10px] font-bold uppercase tracking-widest text-red-600 transition-colors hover:bg-red-100"
                  >
                    {t("Salir")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
SiteHeader.displayName = "SiteHeader";
