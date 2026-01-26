import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Dropdown menu stub - basic implementation
 */
import { forwardRef } from "react";
export const DropdownMenu = forwardRef(({ children, ...props }, ref) =>
  _jsx("div", {
    ref: ref,
    className: "relative inline-block text-left",
    ...props,
    children: children,
  }),
);
DropdownMenu.displayName = "DropdownMenu";
export const DropdownMenuTrigger = forwardRef(
  ({ children, asChild, ...props }, ref) =>
    _jsx("button", { ref: ref, ...props, children: children }),
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";
export const DropdownMenuContent = forwardRef(
  ({ children, className, ...props }, ref) =>
    _jsx("div", {
      ref: ref,
      className: `absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${className || ""}`,
      ...props,
      children: _jsx("div", { className: "py-1", children: children }),
    }),
);
DropdownMenuContent.displayName = "DropdownMenuContent";
export const DropdownMenuItem = forwardRef(
  ({ children, className, ...props }, ref) =>
    _jsx("div", {
      ref: ref,
      className: `block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${className || ""}`,
      ...props,
      children: children,
    }),
);
DropdownMenuItem.displayName = "DropdownMenuItem";
export const DropdownMenuLabel = forwardRef(
  ({ children, className, ...props }, ref) =>
    _jsx("div", {
      ref: ref,
      className: `px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase ${className || ""}`,
      ...props,
      children: children,
    }),
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";
export const DropdownMenuSeparator = forwardRef(
  ({ className, ...props }, ref) =>
    _jsx("div", {
      ref: ref,
      className: `my-1 border-t border-gray-200 dark:border-gray-700 ${className || ""}`,
      ...props,
    }),
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
