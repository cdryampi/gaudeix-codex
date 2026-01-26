import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Badge stub using Flowbite React
 */
import { Badge as FlowbiteBadge } from "flowbite-react";
import { forwardRef } from "react";
export const Badge = forwardRef(
  ({ variant = "default", className, children, ...props }, ref) => {
    const colorMap = {
      default: "info",
      secondary: "gray",
      destructive: "failure",
      outline: "light",
    };
    return _jsx(FlowbiteBadge, {
      ref: ref,
      color: colorMap[variant],
      className: className,
      ...props,
      children: children,
    });
  },
);
Badge.displayName = "Badge";
