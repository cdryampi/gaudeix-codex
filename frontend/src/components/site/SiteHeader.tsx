import { useState } from "react";
import { LogIn, ChevronDown, Navigation, User, X } from "lucide-react";
import { Heart, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { HEADER_NAV, type HeaderNavItem } from "@/data/headerNav";
import { useAuthStore } from "@/features/auth/store";
import {
  getHeaderMenuTree,
  type MenuTreeItem,
} from "@/features/site-settings/api/menuApi";
import logoCabrera from "@/assets/logo/logo-cabrera-white.png";

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
}: {
  siteName?: string;
  isTransparent?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

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
      <div
        className={`w-full transition-all duration-500 ${
          isTransparent
            ? "bg-transparent"
            : "bg-white/95 backdrop-blur-2xl border-b border-slate-100 shadow-lg"
        }`}
      >
        <div className="container mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="flex items-center shrink-0">
            <div
              className={`transition-all duration-500 ${!isTransparent ? "brightness-0" : "brightness-100"}`}
            >
              <img
                src={logoCabrera}
                alt={siteName}
                className="h-9 md:h-10 w-auto object-contain"
              />
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-1 mx-8">
            {navItems.map((item, idx) => (
              <div key={idx} className="group relative">
                <Link
                  to={item.href || "#"}
                  className={`flex items-center gap-1.5 px-4 py-6 text-[11px] font-extrabold uppercase tracking-[0.2em] transition-all relative ${
                    isTransparent
                      ? "text-white/90 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown className="h-3 w-3 opacity-40 group-hover:rotate-180 transition-transform duration-300" />
                  )}
                  {/* Active indicator */}
                  <span
                    className={`absolute bottom-4 left-4 right-4 h-0.5 rounded-full transition-all duration-300 scale-x-0 group-hover:scale-x-100 ${
                      isTransparent ? "bg-accent" : "bg-primary"
                    }`}
                  />
                </Link>

                {/* Mega Dropdown */}
                {item.children && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1 z-50">
                    <div
                      className={`rounded-2xl shadow-[0_16px_64px_rgba(0,0,0,0.12)] border border-slate-100 bg-white overflow-hidden ${
                        item.children.length > 4
                          ? "p-6 min-w-[400px] grid grid-cols-2 gap-1"
                          : "p-3 min-w-[220px] grid gap-0.5"
                      }`}
                    >
                      {item.children.map((child, cIdx) => (
                        <Link
                          key={cIdx}
                          to={child.href || "#"}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all group/item"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/30 group-hover/item:bg-primary transition-colors shrink-0" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/como-llegar"
              className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all ${
                isTransparent
                  ? "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  : "bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10"
              }`}
            >
              <Navigation className="h-3.5 w-3.5" />
              Llegar
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/mis-favoritos"
                  className={`flex items-center gap-2 h-10 px-3 rounded-xl transition-all ${
                    isTransparent
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                  }`}
                  title="Mis Favoritos"
                >
                  <Heart
                    className={`h-4 w-4 ${isTransparent ? "text-white" : "text-rose-500"}`}
                  />
                </Link>
                <div className="hidden md:flex items-center gap-2">
                  <div
                    className={`group relative flex items-center gap-2 h-10 px-3 rounded-xl cursor-pointer ${
                      isTransparent
                        ? "bg-white/10 text-white"
                        : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    <User
                      className={`h-4 w-4 ${isTransparent ? "text-white" : "text-primary"}`}
                    />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">
                      {user?.username}
                    </span>

                    {/* User Dropdown */}
                    <div className="invisible absolute right-0 top-full mt-2 w-44 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 translate-y-1 group-hover:opacity-100 z-50">
                      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5">
                        <Link
                          to="/mis-favoritos"
                          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                          <Heart className="h-3.5 w-3.5" />
                          Favoritos
                        </Link>
                        <button
                          onClick={() => logout()}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50"
                        >
                          <LogIn className="h-3.5 w-3.5 rotate-180" />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className={`hidden md:flex h-10 items-center gap-2 px-6 rounded-xl transition-all font-extrabold text-[10px] uppercase tracking-widest ${
                  !isTransparent
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-primary"
                    : "bg-white text-slate-900 shadow-lg hover:scale-105"
                }`}
              >
                <LogIn className="h-3.5 w-3.5" />
                Entrar
              </Link>
            )}

            {/* MOBILE HAMBURGER */}
            <button
              onClick={() => setMobileOpen(true)}
              className={`lg:hidden flex items-center justify-center h-10 w-10 rounded-xl transition-all ${
                isTransparent
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 h-20 border-b border-slate-50">
              <img
                src={logoCabrera}
                alt={siteName}
                className="h-8 w-auto brightness-0"
              />
              <button
                onClick={() => setMobileOpen(false)}
                className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            {/* Drawer Nav */}
            <nav className="flex-1 overflow-y-auto py-3">
              {navItems.map((item, idx) => (
                <div key={idx}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() =>
                          setMobileExpanded(
                            mobileExpanded === item.label ? null : item.label,
                          )
                        }
                        className="flex items-center justify-between w-full px-6 py-4 text-[13px] font-extrabold uppercase tracking-widest text-slate-800 hover:bg-slate-50 transition-colors"
                      >
                        {item.label}
                        <ChevronDown
                          className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                            mobileExpanded === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {mobileExpanded === item.label && (
                        <div className="bg-slate-50/80 py-1">
                          {item.children.map((child, cIdx) => (
                            <Link
                              key={cIdx}
                              to={child.href || "#"}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 px-8 py-3 text-xs font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest"
                            >
                              <span className="h-1 w-1 rounded-full bg-primary/40" />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.href || "#"}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-6 py-4 text-[13px] font-extrabold uppercase tracking-widest text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Drawer Footer */}
            <div className="border-t border-slate-100 p-5 space-y-2.5">
              <Link
                to="/como-llegar"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 h-11 rounded-xl bg-primary/5 text-primary text-xs font-extrabold uppercase tracking-widest hover:bg-primary/10 transition-colors border border-primary/10"
              >
                <Navigation className="h-3.5 w-3.5" />
                Cómo llegar
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-800">
                      {user?.username}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to="/mis-favoritos"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-rose-50 text-rose-500 text-xs font-extrabold uppercase tracking-widest"
                    >
                      <Heart className="h-3.5 w-3.5" />
                      Favoritos
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="flex-1 h-11 rounded-xl bg-red-600 text-white text-xs font-extrabold uppercase tracking-widest hover:bg-red-700 transition-colors"
                    >
                      Salir
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold uppercase tracking-widest hover:bg-primary transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
