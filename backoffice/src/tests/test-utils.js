import { jsx as _jsx } from "react/jsx-runtime";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "@/app/providers/AppProviders";
/**
 * Custom render function that wraps components with all necessary providers
 * Use this instead of RTL's render in tests
 */
function customRender(ui, options) {
  return render(ui, {
    wrapper: ({ children }) =>
      _jsx(BrowserRouter, {
        children: _jsx(AppProviders, { children: children }),
      }),
    ...options,
  });
}
export * from "@testing-library/react";
export { customRender as render };
