/**
 * Badge stub using Flowbite React
 */
import { Badge as FlowbiteBadge } from "flowbite-react";
import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    const colorMap = {
      default: "info",
      secondary: "gray",
      destructive: "failure",
      outline: "light",
    } as const;

    return (
      <FlowbiteBadge ref={ref} color={colorMap[variant]} className={className} {...props}>
        {children}
      </FlowbiteBadge>
    );
  }
);

Badge.displayName = "Badge";
