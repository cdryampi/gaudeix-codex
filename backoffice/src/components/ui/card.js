import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Card stub using Flowbite React
 */
import { Card as FlowbiteCard } from "flowbite-react";
import { forwardRef } from "react";
export const Card = forwardRef(({ className, ...props }, ref) =>
  _jsx(FlowbiteCard, { ref: ref, className: className, ...props }),
);
Card.displayName = "Card";
export const CardHeader = forwardRef(({ className, ...props }, ref) =>
  _jsx("div", {
    ref: ref,
    className: `flex flex-col space-y-1.5 p-6 ${className || ""}`,
    ...props,
  }),
);
CardHeader.displayName = "CardHeader";
export const CardTitle = forwardRef(({ className, ...props }, ref) =>
  _jsx("h3", {
    ref: ref,
    className: `text-2xl font-semibold leading-none tracking-tight ${className || ""}`,
    ...props,
  }),
);
CardTitle.displayName = "CardTitle";
export const CardDescription = forwardRef(({ className, ...props }, ref) =>
  _jsx("p", {
    ref: ref,
    className: `text-sm text-gray-500 dark:text-gray-400 ${className || ""}`,
    ...props,
  }),
);
CardDescription.displayName = "CardDescription";
export const CardContent = forwardRef(({ className, ...props }, ref) =>
  _jsx("div", { ref: ref, className: `p-6 pt-0 ${className || ""}`, ...props }),
);
CardContent.displayName = "CardContent";
export const CardFooter = forwardRef(({ className, ...props }, ref) =>
  _jsx("div", {
    ref: ref,
    className: `flex items-center p-6 pt-0 ${className || ""}`,
    ...props,
  }),
);
CardFooter.displayName = "CardFooter";
