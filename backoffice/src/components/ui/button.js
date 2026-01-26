import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
/**
 * Button component - Custom implementation with Tailwind CSS
 * Direct Tailwind classes for better visibility and control
 */
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
export const Button = forwardRef(
  (
    {
      variant = "default",
      size = "default",
      className,
      children,
      asChild,
      ...props
    },
    ref,
  ) => {
    // If asChild is true, render children directly (for Link wrappers)
    if (asChild) {
      return _jsx(_Fragment, { children: children });
    }
    // Variant styles using direct Tailwind classes
    const variantStyles = {
      default:
        "bg-primary-600 text-white hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900",
      outline:
        "border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700",
      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-4 focus:ring-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700",
      ghost:
        "text-gray-900 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:text-white dark:hover:bg-gray-800 dark:focus:ring-gray-700",
      link: "text-primary-600 hover:underline dark:text-primary-500",
    };
    // Size styles
    const sizeStyles = {
      default: "px-5 py-2.5 text-sm",
      sm: "px-3 py-2 text-xs",
      lg: "px-5 py-3 text-base",
      icon: "p-2.5",
    };
    // Base styles
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
    return _jsx("button", {
      ref: ref,
      className: cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      ),
      ...props,
      children: children,
    });
  },
);
Button.displayName = "Button";
