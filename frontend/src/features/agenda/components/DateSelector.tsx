import { useMemo } from "react";

export function DateSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (iso: string) => void;
}) {
  const dates = useMemo(() => {
    const arr = [];
    const now = new Date();

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);

      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate(),
      ).padStart(2, "0")}`;

      let dayLabel = new Intl.DateTimeFormat("es-ES", { weekday: "short" })
        .format(date)
        .toUpperCase()
        .replace(".", "");
      if (i === 0) dayLabel = "HOY";
      if (i === 1) dayLabel = "MANANA";

      arr.push({
        iso,
        dayNum: date.getDate(),
        dayLabel,
      });
    }

    return arr;
  }, []);

  return (
    <div className="w-full">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {dates.map((date) => (
          <button
            key={date.iso}
            onClick={() => onSelect(date.iso)}
            className={`rounded-2xl border px-3 py-4 text-center transition ${
              selected === date.iso
                ? "border-primary bg-primary text-white"
                : "border-[color:var(--color-border-soft)] bg-slate-50 text-slate-700 hover:border-primary/30 hover:bg-white"
            }`}
          >
            <span
              className={`block text-[11px] font-semibold uppercase tracking-[0.16em] ${
                selected === date.iso ? "text-white/80" : "text-slate-500"
              }`}
            >
              {date.dayLabel}
            </span>
            <span className="mt-2 block text-2xl font-bold">{date.dayNum}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
