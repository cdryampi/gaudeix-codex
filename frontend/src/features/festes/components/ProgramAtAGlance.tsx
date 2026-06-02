import { Download } from "lucide-react";

import { Festa } from "../types";

interface ProgramAtAGlanceProps {
  festa: Festa;
}

export const ProgramAtAGlance = ({ festa }: ProgramAtAGlanceProps) => {
  const events = (festa.events || []).slice(0, 4);
  const eventCount =
    typeof festa.events_count === "number" && festa.events_count > 0
      ? festa.events_count
      : festa.events?.length || 0;

  return (
    <section className="bg-green-50 py-16 lg:py-20 border-b border-green-100">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green mb-4 block">
            At a Glance
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter leading-[1.15] uppercase max-w-3xl mx-auto">
            Celebrem la Festa Major amb mes de {eventCount} actes per a tota la
            familia.
          </h2>
        </div>

        {events.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 mb-12 text-center divide-x-0 md:divide-x divide-slate-300/30">
            {events.map((event) => {
              const date = new Date(event.start_at);
              return (
                <div key={event.id} className="flex flex-col items-center px-4">
                  <span className="text-[12px] md:text-[13px] font-black uppercase tracking-wider text-slate-900 mb-1 leading-tight line-clamp-1 max-w-[150px]">
                    {event.category_name || "Acte"}:
                  </span>
                  <span className="text-[15px] font-bold text-slate-700 capitalize">
                    {date.toLocaleDateString("ca-ES", {
                      weekday: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center">
          {festa.program_pdf?.file ? (
            <a
              href={festa.program_pdf.file}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 h-14 px-10 rounded-full bg-green text-white text-[12px] font-black uppercase tracking-widest hover:bg-green-600 transition-colors shadow-xl shadow-green/20 hover:shadow-2xl hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              Descarregar Programa (PDF)
            </a>
          ) : (
            <div className="inline-flex items-center justify-center gap-3 h-14 px-10 rounded-full bg-slate-300 text-slate-50 text-[12px] font-black uppercase tracking-widest cursor-not-allowed">
              <Download className="w-4 h-4" />
              Programa properament
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
