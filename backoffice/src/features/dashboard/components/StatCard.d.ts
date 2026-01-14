import { LucideIcon } from "lucide-react";
interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    className?: string;
}
export declare function StatCard({ title, value, icon: Icon, description, className }: StatCardProps): import("react/jsx-runtime").JSX.Element;
export {};
