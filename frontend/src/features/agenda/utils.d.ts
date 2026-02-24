import { Event, EventDate } from "@/features/events/types";
export type DateRangeFilter = "today" | "week" | "month" | "all" | string;
export declare function getNextSession(dates: EventDate[]): EventDate | null;
export declare function getRangeParams(range: DateRangeFilter, now?: Date): {
    start_from?: string;
    start_to?: string;
};
export declare function sortEventsByDate(list: Event[]): Event[];
export declare function isToday(date: Date, now?: Date): boolean;
export declare function isTomorrow(date: Date, now?: Date): boolean;
export declare function withinRange(startAt: string, range: DateRangeFilter, now?: Date): boolean;
export declare function matchesQuery(event: Event, query: string): boolean;
export declare function filterEvents(events: Event[], opts: {
    category: string | "all";
    range: DateRangeFilter;
    query: string;
}): Event[];
export declare function formatDayLabel(date: Date): string;
export declare function groupEventsByDay(list: Event[]): {
    dayLabel: string;
    items: Event[];
}[];
