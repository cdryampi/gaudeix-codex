import { Facebook, Instagram, X, Youtube } from "lucide-react";
import logoCabrera from "@/assets/logo/logo-cabrera-white.png";

export function SiteFooter() {
  return (
    <footer className="bg-slate-950 py-24 text-white">
      <div className="container mx-auto flex flex-col items-center gap-12 px-6 md:flex-row md:justify-between">
        <img
          src={logoCabrera}
          alt="Cabrera de Mar"
          className="h-16 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0"
        />
        <div className="flex gap-8">
          <a
            href="#"
            aria-label="Instagram"
            title="Instagram"
            className="text-slate-500 hover:text-white"
          >
            <Instagram className="h-6 w-6" />
          </a>
          <a
            href="#"
            aria-label="X"
            title="X"
            className="text-slate-500 hover:text-white"
          >
            <X className="h-6 w-6" />
          </a>
          <a
            href="#"
            aria-label="Facebook"
            title="Facebook"
            className="text-slate-500 hover:text-white"
          >
            <Facebook className="h-6 w-6" />
          </a>
          <a
            href="#"
            aria-label="YouTube"
            title="YouTube"
            className="text-slate-500 hover:text-white"
          >
            <Youtube className="h-6 w-6" />
          </a>
        </div>
      </div>
      <div className="container mx-auto mt-12 border-t border-white/5 pt-8 text-center text-xs text-slate-400">
        <p className="text-sm leading-normal text-slate-300 md:text-sm">
          &copy; {new Date().getFullYear()} Ajuntament de Cabrera de Mar. Tots
          els drets reservats.
        </p>
      </div>
    </footer>
  );
}
