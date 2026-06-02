import { Mail, ExternalLink } from "lucide-react";

import { CabritaSvgMascot } from "./CabritaSvgMascot";

export function CabritaPremiumMaintenance() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-light p-4 font-sans antialiased">
      <section
        aria-labelledby="maintenance-title"
        className="flex w-full max-w-xl flex-col items-center rounded-3xl border border-border-soft bg-surface px-6 py-10 text-center shadow-[0_30px_70px_rgba(15,76,129,0.06)] md:px-12 md:py-14"
      >
        <CabritaSvgMascot />

        <div className="mt-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-secondary">
            Serveis sincronitzant
          </p>
          <h1
            id="maintenance-title"
            className="text-2xl font-bold leading-tight tracking-tight text-text-primary text-wrap-balance md:text-3xl"
          >
            El portal de Cabrera està en manteniment
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-text-secondary text-wrap-balance md:text-base">
            Estem realitzant millores programades per oferir-te una experiència
            digital més estable. Tornarem a estar en línia molt aviat.
          </p>
        </div>

        <div className="mt-8 grid w-full gap-3 border-t border-border-soft pt-6 text-sm sm:grid-cols-2">
          <a
            href="mailto:suport@cabrerademar.cat"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border-soft bg-surface-muted px-4 py-3 font-semibold text-secondary transition-colors hover:border-secondary/20 hover:bg-secondary/5"
          >
            <Mail className="h-4 w-4" />
            Suport
          </a>
          <a
            href="https://www.cabrerademar.cat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border-soft bg-surface-muted px-4 py-3 font-semibold text-text-secondary transition-colors hover:border-destructive/20 hover:bg-destructive/5 hover:text-destructive"
          >
            Web municipal
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
