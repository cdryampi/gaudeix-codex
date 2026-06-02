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

import { useLanguageStore } from "../site-settings/languageStore";

export function getWhenLabel(date: Date, now = new Date()): string | null {
  const lang = useLanguageStore.getState().language;
  if (isToday(date, now)) {
    const map: Record<string, string> = {
      ca: "Avui",
      es: "Hoy",
      en: "Today",
      fr: "Aujourd'hui",
    };
    return map[lang] || "Hoy";
  }
  if (isTomorrow(date, now)) {
    const map: Record<string, string> = {
      ca: "Demà",
      es: "Mañana",
      en: "Tomorrow",
      fr: "Demain",
    };
    return map[lang] || "Mañana";
  }
  return null;
}

function getCurrentLocale() {
  const lang = useLanguageStore.getState().language;
  const map: Record<string, string> = {
    ca: "ca-ES",
    es: "es-ES",
    en: "en-US",
    fr: "fr-FR",
  };
  return map[lang] || "es-ES";
}

export function formatDay(date: Date, locale?: string) {
  return new Intl.DateTimeFormat(locale || getCurrentLocale(), {
    day: "2-digit",
  }).format(date);
}

export function formatMonthShort(date: Date, locale?: string) {
  return new Intl.DateTimeFormat(locale || getCurrentLocale(), {
    month: "short",
  })
    .format(date)
    .replace(".", "");
}

export function formatTime(date: Date, locale?: string) {
  return new Intl.DateTimeFormat(locale || getCurrentLocale(), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateTime(dateString: string, locale?: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale || getCurrentLocale(), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
