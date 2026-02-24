import { useEffect, useState } from "react";
import { LogIn, ChevronDown, Navigation, User } from "lucide-react";
import { Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { HEADER_NAV, type HeaderNavItem } from "@/data/headerNav";
import { useAuthStore } from "@/features/auth/store";
import logoCabrera from "@/assets/logo/logo-cabrera-white.png";

export function SiteHeader({
  siteName = "Cabrera de Mar",
  isTransparent = false,
}: {
  siteName?: string;
  isTransparent?: boolean;
}) {
  const navItems: HeaderNavItem[] = HEADER_NAV;
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const { pathname } = useLocation();

  return (
    <div
      className={`w-full h-24 transition-all duration-500 ${
        isTransparent
          ? "bg-transparent"
          : "bg-white/90 backdrop-blur-2xl border-b border-slate-100 shadow-xl"
      }`}
    >
      <div className="container mx-auto px-8 h-full flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center group">
          <div
            className={`transition-all duration-500 ${!isTransparent ? "brightness-0" : "brightness-100"}`}
          >
            <img
              src={logoCabrera}
              alt={siteName}
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-12">
          {navItems.map((item, idx) => (
            <div key={idx} className="group relative py-8">
              <Link
                to={item.href || "#"}
                className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] transition-all hover:scale-105 ${
                  isTransparent
                    ? "text-white hover:text-white"
                    : "text-slate-900 hover:text-primary"
                }`}
              >
                {item.label}
                {item.children && (
                  <ChevronDown
                    className={`h-3 w-3 opacity-30 group-hover:rotate-180 transition-transform duration-300`}
                  />
                )}
              </Link>

              {/* Submenu */}
              {item.children && (
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                  <div className="bg-white rounded-[2rem] shadow-[0_20px_80px_rgba(0,0,0,0.15)] border border-slate-50 p-8 min-w-[280px] grid gap-6">
                    {item.children.map((child, cIdx) => (
                      <div key={cIdx} className="space-y-4">
                        <Link
                          to={child.href || "#"}
                          className="block text-[10px] font-black uppercase tracking-widest text-slate-900 hover:text-primary transition-colors"
                        >
                          {child.label}
                        </Link>
                        {child.children && (
                          <div className="pl-4 border-l-2 border-slate-100 space-y-3">
                            {child.children.map((subChild, scIdx) => (
                              <Link
                                key={scIdx}
                                to={subChild.href || "#"}
                                className="block text-[9px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
                              >
                                {subChild.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-6">
          <Link
            to="/como-llegar"
            className={`hidden md:flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isTransparent
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                }`}
                title="Mis Favoritos"
              >
                <Heart
                  className={`h-4 w-4 ${isTransparent ? "text-white" : "text-rose-500"}`}
                />
                <span className="hidden xl:inline text-[10px] font-black uppercase tracking-widest">
                  Favoritos
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isTransparent ? "bg-white/10" : "bg-slate-50"}`}
                >
                  <User
                    className={`h-4 w-4 ${isTransparent ? "text-white" : "text-primary"}`}
                  />
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${isTransparent ? "text-white" : "text-slate-900"}`}
                  >
                    {user?.username}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className="h-11 px-6 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  SALIR
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className={`flex h-11 items-center gap-3 px-8 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${
                !isTransparent
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:bg-primary"
                  : "bg-white text-slate-900 shadow-xl hover:scale-105"
              }`}
            >
              <LogIn className="h-4 w-4" />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
