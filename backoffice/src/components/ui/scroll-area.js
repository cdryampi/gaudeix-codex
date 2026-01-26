import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Scroll Area stub - basic div with overflow
 */
import { forwardRef } from "react";
export const ScrollArea = forwardRef(({ className, children, ...props }, ref) =>
  _jsx("div", {
    ref: ref,
    className: `relative overflow-auto ${className || ""}`,
    ...props,
    children: children,
  }),
);
ScrollArea.displayName = "ScrollArea";
