import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
/**
 * AuthLayout - Single centered card layout for authentication
 * Cleaner, centered approach as requested
 */
export function AuthLayout() {
  return _jsxs("div", {
    className:
      "flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900",
    children: [
      _jsxs("div", {
        className: "fixed inset-0 z-0 pointer-events-none overflow-hidden",
        children: [
          _jsx("div", {
            className:
              "absolute -top-[30%] -left-[10%] h-[70%] w-[70%] rounded-full bg-primary-500/5 blur-3xl",
          }),
          _jsx("div", {
            className:
              "absolute top-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-indigo-500/5 blur-3xl",
          }),
        ],
      }),
      _jsxs("div", {
        className: "relative z-10 w-full max-w-[440px]",
        children: [
          _jsxs("div", {
            className: "mb-8 flex flex-col items-center justify-center",
            children: [
              _jsx("div", {
                className:
                  "flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-xl shadow-primary-600/20 mb-4",
                children: _jsx("span", {
                  className: "text-2xl font-black text-white tracking-tighter",
                  children: "GC",
                }),
              }),
              _jsx("h1", {
                className:
                  "text-2xl font-bold tracking-tight text-gray-900 dark:text-white",
                children: "Gaudeix Codex",
              }),
              _jsx("p", {
                className: "text-sm text-gray-500 dark:text-gray-400",
                children: "Plataforma de Gesti\u00F3n",
              }),
            ],
          }),
          _jsx("div", {
            className:
              "rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-800 dark:shadow-none",
            children: _jsx(Outlet, {}),
          }),
          _jsxs("div", {
            className:
              "mt-8 text-center text-xs text-gray-400 dark:text-gray-500",
            children: [
              "\u00A9 ",
              new Date().getFullYear(),
              " Gaudeix Platform. Todos los derechos reservados.",
            ],
          }),
        ],
      }),
    ],
  });
}
