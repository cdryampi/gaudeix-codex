export declare function isToday(date: Date, now?: Date): boolean;
export declare function isTomorrow(date: Date, now?: Date): boolean;
export declare function getWhenLabel(date: Date, now?: Date): "Hoy" | "Mañana" | null;
export declare function formatDay(date: Date, locale?: string): string;
export declare function formatMonthShort(date: Date, locale?: string): string;
export declare function formatTime(date: Date, locale?: string): string;
export declare function formatDateTime(dateString: string, locale?: string): string;
