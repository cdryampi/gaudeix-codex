import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Alert stub using Flowbite React
 */
import { Alert as FlowbiteAlert } from "flowbite-react";
import { forwardRef } from "react";
export const Alert = forwardRef(
  ({ variant = "default", className, children, ...props }, ref) => {
    const color = variant === "destructive" ? "failure" : "info";
    return _jsx(FlowbiteAlert, {
      ref: ref,
      color: color,
      className: className,
      ...props,
      children: children,
    });
  },
);
Alert.displayName = "Alert";
export const AlertDescription = forwardRef(({ className, ...props }, ref) =>
  _jsx("p", { ref: ref, className: `text-sm ${className || ""}`, ...props }),
);
AlertDescription.displayName = "AlertDescription";
export const AlertTitle = forwardRef(({ className, ...props }, ref) =>
  _jsx("h5", {
    ref: ref,
    className: `mb-1 font-medium leading-none tracking-tight ${className || ""}`,
    ...props,
  }),
);
AlertTitle.displayName = "AlertTitle";
