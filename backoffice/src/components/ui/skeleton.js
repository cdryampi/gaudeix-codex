import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Skeleton stub - loading placeholder
 */
import { forwardRef } from "react";
export const Skeleton = forwardRef(({ className, ...props }, ref) =>
  _jsx("div", {
    ref: ref,
    className: `animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className || ""}`,
    ...props,
  }),
);
Skeleton.displayName = "Skeleton";
