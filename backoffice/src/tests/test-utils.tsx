import { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { AppProviders } from "@/app/providers/AppProviders";

/* eslint-disable react-refresh/only-export-components */

type RouterMode =
  | { type?: "browser" }
  | { type: "memory"; initialEntries?: string[] };

type CustomRenderOptions = Omit<RenderOptions, "wrapper"> & {
  router?: RouterMode;
};

function Providers({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions,
): ReturnType<typeof render> {
  const { router, ...renderOptions } = options ?? {};

  const Wrapper = ({ children }: { children: ReactNode }) => {
    if (router?.type === "memory") {
      return (
        <MemoryRouter initialEntries={router.initialEntries}>
          <Providers>{children}</Providers>
        </MemoryRouter>
      );
    }

    return (
      <BrowserRouter>
        <Providers>{children}</Providers>
      </BrowserRouter>
    );
  };

  return render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
}

export * from "@testing-library/react";
export { customRender as render };
