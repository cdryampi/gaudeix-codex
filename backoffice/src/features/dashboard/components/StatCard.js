import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function StatCard({ title, value, icon: Icon, description, className }) {
  return _jsxs(Card, {
    className: className,
    children: [
      _jsxs(CardHeader, {
        className: "flex flex-row items-center justify-between space-y-0 pb-2",
        children: [
          _jsx(CardTitle, {
            className: "text-sm font-medium",
            children: title,
          }),
          _jsx(Icon, { className: "h-4 w-4 text-muted-foreground" }),
        ],
      }),
      _jsxs(CardContent, {
        children: [
          _jsx("div", { className: "text-2xl font-bold", children: value }),
          description &&
            _jsx("p", {
              className: "text-xs text-muted-foreground mt-1",
              children: description,
            }),
        ],
      }),
    ],
  });
}
