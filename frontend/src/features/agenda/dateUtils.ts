export function isToday(date: Date, now = new Date()) {
  const a = new Date(date);
  a.setHours(0, 0, 0, 0);
  const b = new Date(now);
  b.setHours(0, 0, 0, 0);
  return a.getTime() === b.getTime();
}

export function isTomorrow(date: Date, now = new Date()) {
  const t = new Date(now);
  t.setHours(0, 0, 0, 0);
  t.setDate(t.getDate() + 1);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime() === t.getTime();
}

export function getWhenLabel(date: Date, now = new Date()): "Hoy" | "Mañana" | null {
  if (isToday(date, now)) return "Hoy";
  if (isTomorrow(date, now)) return "Mañana";
  return null;
}

// i18n: preparado para cambiar locale fácilmente (es-ES / ca-ES).
const DEFAULT_LOCALE = "es-ES";

export function formatDay(date: Date, locale = DEFAULT_LOCALE) {
  return new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(date);
}

export function formatMonthShort(date: Date, locale = DEFAULT_LOCALE) {
  return new Intl.DateTimeFormat(locale, { month: "short" }).format(date).replace(".", "");
}

export function formatTime(date: Date, locale = DEFAULT_LOCALE) {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(date);
}

