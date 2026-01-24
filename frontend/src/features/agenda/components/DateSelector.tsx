import { useMemo } from "react";

export function DateSelector({ selected, onSelect }: { selected: string; onSelect: (iso: string) => void }) {
    const dates = useMemo(() => {
        const arr = [];
        const now = new Date();
        // EXACTLY 7 DAYS
        for (let i = 0; i < 7; i++) {
            const d = new Date(now);
            d.setDate(now.getDate() + i);
            const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            let dayLabel = new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(d).toUpperCase().replace('.', '');
            if (i === 0) dayLabel = "Hoy";
            if (i === 1) dayLabel = "Mañana";

            arr.push({
                iso,
                dayNum: d.getDate(),
                dayLabel,
            });
        }
        return arr;
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            {/* SEGMENTED CONTROL STYLE - NO SCROLL */}
            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2 md:gap-4 p-2 bg-white/5 rounded-[3rem] backdrop-blur-xl border border-white/10">
                {dates.map((d) => (
                    <button
                        key={d.iso}
                        onClick={() => onSelect(d.iso)}
                        className={`flex-1 min-w-[70px] md:min-w-0 flex flex-col items-center justify-center py-6 md:py-10 rounded-[2.5rem] transition-all duration-500 overflow-hidden relative ${selected === d.iso
                                ? 'bg-accent text-slate-900 shadow-2xl scale-100'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${selected === d.iso ? 'text-slate-900/60' : 'text-white/30'}`}>
                            {d.dayLabel}
                        </span>
                        <span className="text-3xl md:text-5xl font-black italic tracking-tighter leading-none">
                            {d.dayNum}
                        </span>

                        {selected === d.iso && (
                            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-900/10" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
