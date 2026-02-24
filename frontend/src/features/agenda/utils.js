export function getNextSession(dates) {
    const now = new Date().getTime();
    return (dates
        .filter((d) => new Date(d.start_at).getTime() >= now)
        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())[0] || null);
}
export function getRangeParams(range, now = new Date()) {
    if (range === "all")
        return {};
    if (/^\d{4}-\d{2}-\d{2}$/.test(range)) {
        const d = new Date(range);
        return {
            start_from: startOfDay(d).toISOString(),
            start_to: endOfDay(d).toISOString(),
        };
    }
    const start = startOfDay(now);
    const end = range === "today"
        ? endOfDay(now)
        : range === "week"
            ? endOfDay(addDays(now, 7))
            : endOfDay(addMonths(now, 1));
    return {
        start_from: start.toISOString(),
        start_to: end.toISOString(),
    };
}
function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
function endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}
export function sortEventsByDate(list) {
    return [...list].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
}
export function isToday(date, now = new Date()) {
    const a = startOfDay(date).getTime();
    const b = startOfDay(now).getTime();
    return a === b;
}
export function isTomorrow(date, now = new Date()) {
    const tomorrow = startOfDay(addDays(now, 1)).getTime();
    return startOfDay(date).getTime() === tomorrow;
}
export function withinRange(startAt, range, now = new Date()) {
    if (range === "all")
        return true;
    // Specific ISO Date (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(range)) {
        const d = new Date(startAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return key === range;
    }
    const start = startOfDay(now);
    const end = range === "today"
        ? endOfDay(now)
        : range === "week"
            ? endOfDay(addDays(now, 7))
            : endOfDay(addMonths(now, 1));
    const d = new Date(startAt);
    return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
}
export function matchesQuery(event, query) {
    const q = query.trim().toLowerCase();
    if (!q)
        return true;
    const haystack = `${event.title} ${event.venue_name} ${event.location_text}`.toLowerCase();
    return haystack.includes(q);
}
export function filterEvents(events, opts) {
    return events.filter((e) => {
        // Note: We use category_name or category_slug for filtering if needed.
        // Assuming UI passes "all" or a category name/slug.
        if (opts.category !== "all") {
            // Loose matching since backend category names might vary
            const cat = (e.category_name || "").toLowerCase();
            const filterCat = opts.category.toLowerCase();
            if (!cat.includes(filterCat))
                return false;
        }
        const hasDateInRange = e.dates?.some((d) => withinRange(d.start_at, opts.range)) ??
            withinRange(e.start_at, opts.range);
        if (!hasDateInRange)
            return false;
        if (!matchesQuery(e, opts.query))
            return false;
        return true;
    });
}
export function formatDayLabel(date) {
    const fmt = new Intl.DateTimeFormat("es-ES", {
        weekday: "long",
        day: "2-digit",
        month: "long",
    });
    const label = fmt.format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
}
export function groupEventsByDay(list) {
    const sorted = sortEventsByDate(list);
    const map = new Map();
    for (const item of sorted) {
        const d = new Date(item.start_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const existing = map.get(key);
        if (existing) {
            existing.items.push(item);
        }
        else {
            map.set(key, { dayLabel: formatDayLabel(d), items: [item] });
        }
    }
    return Array.from(map.values());
}
