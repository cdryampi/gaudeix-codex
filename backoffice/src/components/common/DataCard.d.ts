import { LucideIcon } from "lucide-react";
interface DataCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}
/**
 * DataCard displays a metric with optional icon and trend
 */
export declare function DataCard({ title, value, description, icon: Icon, trend, }: DataCardProps): import("react/jsx-runtime").JSX.Element;
export {};
