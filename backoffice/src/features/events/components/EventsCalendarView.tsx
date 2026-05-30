import { useMemo, useState } from "react";
import type { Event } from "../types";

type Props = {
  events: Event[];
  onEdit: (event: Event) => void;
};

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function EventsCalendarView({ events, onEdit }: Props) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const lastDay = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const startPad = firstDay.getDay();

  const prevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const eventsByDay = useMemo(() => {
    const map = new Map<number, Event[]>();
    for (const event of events) {
      const dates = event.dates?.length
        ? event.dates
        : [{ start_at: event.start_at }];
      for (const d of dates) {
        const day = new Date(d.start_at);
        if (
          day.getMonth() === viewDate.getMonth() &&
          day.getFullYear() === viewDate.getFullYear()
        ) {
          const key = day.getDate();
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push(event);
        }
      }
    }
    return map;
  }, [events, viewDate]);

  const days: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="p-2">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          &larr; Anterior
        </button>
        <h3 className="text-lg font-semibold text-foreground">
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Siguiente &rarr;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-xl border border-border overflow-hidden bg-border">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="bg-muted/50 px-2 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            {wd}
          </div>
        ))}
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`min-h-[100px] bg-card p-1.5 transition-colors ${
              day === null ? "bg-muted/20" : "hover:bg-muted/30"
            }`}
          >
            {day !== null && (
              <>
                <div
                  className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday(day)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-0.5">
                  {(eventsByDay.get(day) || []).slice(0, 3).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onEdit(event)}
                      className="block w-full truncate rounded px-1 py-0.5 text-left text-[11px] font-medium leading-tight transition-colors hover:bg-primary/10 hover:text-primary"
                      style={{
                        backgroundColor: event.is_published
                          ? "rgb(239 246 255)"
                          : "rgb(249 250 251)",
                        color: event.is_published
                          ? "rgb(37 99 235)"
                          : "rgb(107 114 128)",
                      }}
                      title={event.title}
                    >
                      {event.title}
                    </button>
                  ))}
                  {(eventsByDay.get(day) || []).length > 3 && (
                    <div className="px-1 text-[10px] font-medium text-muted-foreground">
                      +{(eventsByDay.get(day) || []).length - 3} más
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
