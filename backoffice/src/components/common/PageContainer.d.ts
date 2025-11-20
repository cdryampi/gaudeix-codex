import { ReactNode } from "react";
interface PageContainerProps {
    children: ReactNode;
    className?: string;
}
/**
 * PageContainer provides consistent padding and max-width for pages
 */
export declare function PageContainer({ children, className }: PageContainerProps): import("react/jsx-runtime").JSX.Element;
export {};
