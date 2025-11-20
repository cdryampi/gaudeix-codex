import { ReactNode } from "react";
interface AppProvidersProps {
    children: ReactNode;
}
/**
 * AppProviders wraps the entire application with all necessary providers.
 * Order matters: Theme → Auth → Query
 */
export declare function AppProviders({ children }: AppProvidersProps): import("react/jsx-runtime").JSX.Element;
export {};
