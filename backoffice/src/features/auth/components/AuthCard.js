import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Auth card component using Flowbite React
 */
import { Card } from "flowbite-react";
export const AuthCard = ({ title, subtitle, footer, children }) => {
  return _jsx(Card, {
    className: "w-full shadow-xl",
    children: _jsxs("div", {
      className: "space-y-5",
      children: [
        _jsxs("div", {
          className: "space-y-2 text-center",
          children: [
            _jsx("h2", {
              className: "text-2xl sm:text-3xl font-semibold tracking-tight",
              children: title,
            }),
            subtitle &&
              _jsx("p", {
                className:
                  "text-sm sm:text-base text-gray-500 dark:text-gray-400",
                children: subtitle,
              }),
          ],
        }),
        _jsx("div", {
          className: "space-y-4 sm:space-y-5",
          children: children,
        }),
        footer &&
          _jsx("div", {
            className:
              "pt-5 text-sm text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700",
            children: footer,
          }),
      ],
    }),
  });
};
