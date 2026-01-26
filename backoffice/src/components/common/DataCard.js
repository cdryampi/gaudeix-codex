import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from "flowbite-react";
/**
 * DataCard displays a metric with optional icon and trend
 */
export function DataCard({ title, value, description, icon: Icon, trend }) {
  return _jsxs(Card, {
    children: [
      _jsxs("div", {
        className: "flex flex-row items-center justify-between space-y-0 pb-2",
        children: [
          _jsx("h5", {
            className: "text-sm font-medium text-gray-900 dark:text-white",
            children: title,
          }),
          Icon &&
            _jsx(Icon, {
              className: "h-4 w-4 text-gray-500 dark:text-gray-400",
            }),
        ],
      }),
      _jsxs("div", {
        children: [
          _jsx("div", {
            className: "text-2xl font-bold text-gray-900 dark:text-white",
            children: value,
          }),
          description &&
            _jsx("p", {
              className: "text-xs text-gray-500 dark:text-gray-400",
              children: description,
            }),
          trend &&
            _jsxs("p", {
              className: `text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`,
              children: [
                trend.isPositive ? "+" : "",
                trend.value,
                "% desde el mes pasado",
              ],
            }),
        ],
      }),
    ],
  });
}
