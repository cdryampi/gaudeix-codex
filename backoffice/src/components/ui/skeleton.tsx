/**
 * Skeleton stub - loading placeholder
 */
import { forwardRef, HTMLAttributes } from "react";

export const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className || ""}`}
      {...props}
    />
  )
);
Skeleton.displayName = "Skeleton";
