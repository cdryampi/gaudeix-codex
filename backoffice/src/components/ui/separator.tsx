/**
 * Separator stub - simple divider
 */
import { forwardRef, HTMLAttributes } from "react";

export const Separator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }>(
  ({ orientation = "horizontal", className, ...props }, ref) => (
    <div
      ref={ref}
      className={`${
        orientation === "horizontal"
          ? "h-px w-full bg-gray-200 dark:bg-gray-700"
          : "w-px h-full bg-gray-200 dark:bg-gray-700"
      } ${className || ""}`}
      {...props}
    />
  )
);
Separator.displayName = "Separator";
