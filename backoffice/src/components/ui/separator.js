import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Separator stub - simple divider
 */
import { forwardRef } from "react";
export const Separator = forwardRef(
  ({ orientation = "horizontal", className, ...props }, ref) =>
    _jsx("div", {
      ref: ref,
      className: `${
        orientation === "horizontal"
          ? "h-px w-full bg-gray-200 dark:bg-gray-700"
          : "w-px h-full bg-gray-200 dark:bg-gray-700"
      } ${className || ""}`,
      ...props,
    }),
);
Separator.displayName = "Separator";
