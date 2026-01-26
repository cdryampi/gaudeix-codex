import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
  className,
}) {
  const toneStyles = {
    neutral: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    primary:
      "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400",
    success:
      "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    warning:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    info: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  };
  return _jsxs("div", {
    className: `group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${className || ""}`,
    children: [
      _jsxs("div", {
        className: "flex items-start justify-between",
        children: [
          _jsxs("div", {
            className: "space-y-1",
            children: [
              _jsx("p", {
                className:
                  "text-sm font-medium text-gray-500 dark:text-gray-400",
                children: label,
              }),
              _jsx("div", {
                className: "flex items-baseline gap-2",
                children: _jsx("h3", {
                  className:
                    "text-2xl font-bold tracking-tight text-gray-900 dark:text-white",
                  children: value,
                }),
              }),
            ],
          }),
          _jsx("div", {
            className: `flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset ring-black/5 transition-transform group-hover:scale-110 dark:ring-white/5 ${toneStyles[tone]}`,
            children: _jsx(Icon, { className: "h-6 w-6", strokeWidth: 2.5 }),
          }),
        ],
      }),
      _jsx("div", {
        className:
          "absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gray-50 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-800/30 pointer-events-none",
      }),
    ],
  });
}
