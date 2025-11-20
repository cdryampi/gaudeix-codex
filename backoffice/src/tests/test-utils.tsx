import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "@/app/providers/AppProviders";

/**
 * Custom render function that wraps components with all necessary providers
 * Use this instead of RTL's render in tests
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        <AppProviders>{children}</AppProviders>
      </BrowserRouter>
    ),
    ...options,
  });
}

export * from "@testing-library/react";
export { customRender as render };
