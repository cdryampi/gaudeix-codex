import { ReactNode } from "react";
interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}
/**
 * PageHeader displays the page title, optional description, and action buttons
 */
export declare function PageHeader({ title, description, actions }: PageHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
