import { ChevronRight, MapPin, Navigation } from "lucide-react";
import { Link } from "react-router-dom";

export const VisitUsCTA = () => {
  return (
    <section className="relative w-full bg-slate-900 py-32 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 400 800" fill="none">
          <circle
            cx="400"
            cy="400"
            r="300"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="10 10"
          />
          <circle cx="400" cy="400" r="200" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="max-w-3xl space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 rounded-full bg-primary/10 border border-primary/20 px-6 py-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                A 25 minutos de Barcelona
              </span>
            </div>

            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.8] tracking-tighter uppercase">
              PLANIFICA <br />
              <span className="text-accent italic">TU VISITA</span>
            </h2>

            <p className="text-xl md:text-2xl text-slate-400 font-bold leading-snug tracking-tight max-w-2xl">
              Descubre cómo llegar a Cabrera de Mar en tren, autobús o coche. Te
              facilitamos todas las rutas y horarios para que solo te preocupes
              de disfrutar.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              to="/como-llegar"
              className="group relative flex h-64 w-64 items-center justify-center rounded-full bg-accent transition-all duration-500 hover:scale-110 hover:shadow-[0_0_80px_rgba(255,241,0,0.3)]"
            >
              <div className="absolute inset-2 rounded-full border-2 border-slate-900/10 border-dashed animate-spin-slow group-hover:border-slate-900/30" />
              <div className="flex flex-col items-center gap-4 text-slate-900">
                <Navigation className="h-10 w-10 transition-transform duration-500 group-hover:-translate-y-2 group-hover:translate-x-2" />
                <span className="text-center text-[10px] font-black uppercase tracking-[0.2em] leading-tight">
                  ¿Cómo <br /> llegar?
                </span>
                <ChevronRight className="h-4 w-4 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Background Accent */}
      <div className="absolute -bottom-48 -left-48 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
    </section>
  );
};
