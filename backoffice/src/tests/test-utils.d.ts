import { ReactElement } from "react";
import { RenderOptions } from "@testing-library/react";
/**
 * Custom render function that wraps components with all necessary providers
 * Use this instead of RTL's render in tests
 */
declare function customRender(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">): import("@testing-library/react").RenderResult<typeof import("@testing-library/dom/types/queries"), HTMLElement, HTMLElement>;
export * from "@testing-library/react";
export { customRender as render };
