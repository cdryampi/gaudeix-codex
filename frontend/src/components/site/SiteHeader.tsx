import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";

import { HEADER_NAV, type HeaderNavItem } from "@/data/headerNav";
import { useAuthStore } from "@/features/auth/store";
import logoCabrera from "@/assets/logo/logo-cabrera-white.png";

const LANGUAGES = [
  { code: "es", label: "ES" },
  { code: "ca", label: "CA" },
  { code: "en", label: "EN" },
];

export function SiteHeader({ siteName = "Cabrera de Mar" }: { siteName?: string }) {
  const navItems: HeaderNavItem[] = HEADER_NAV;
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-[1000] w-full transition-all duration-700 ${scrolled ? "h-20 bg-white/90 backdrop-blur-2xl border-b border-slate-100 shadow-xl" : "h-24 bg-transparent"
        }`}
    >
      <div className="container mx-auto px-8 h-full flex items-center justify-between">

        {/* LOGO - SOLO IMAGEN */}
        <a href="#inicio" className="flex items-center group">
          <div className={`transition-all duration-500 ${scrolled ? 'brightness-0' : 'brightness-100'}`}>
            <img src={logoCabrera} alt="Cabrera de Mar" className="h-12 md:h-14 w-auto object-contain" />
          </div>
        </a>

        {/* NAVIGATION */}
        <nav className={`hidden lg:flex items-center gap-10 transition-all duration-500 ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-[-10px]'}`}>
          {navItems.map((item, idx) => (
            <a key={idx} href={item.href} className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 hover:text-primary transition-colors">
              {item.label}
            </a>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          {/* Simple Language Switcher */}
          <div className="flex border border-white/10 p-1 rounded-xl backdrop-blur-md">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${scrolled ? (lang.code === 'es' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100/50')
                    : (lang.code === 'es' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10')
                  }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {isAuthenticated ? (
            <button onClick={() => logout()} className="h-10 px-4 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors">
              SESIÓN
            </button>
          ) : (
            <Link to="/login" className={`flex h-10 items-center gap-3 px-6 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${scrolled ? 'bg-slate-900 text-white shadow-lg' : 'bg-white/20 text-white backdrop-blur-md border border-white/10'
              }`}>
              <LogIn className="h-4 w-4" />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
