import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, useState, createContext, useContext } from "react";
const TabsContext = createContext(undefined);
export const Tabs = forwardRef(
  (
    {
      children,
      defaultValue = "",
      value: controlledValue,
      onValueChange,
      className,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const value = controlledValue ?? internalValue;
    const setValue = onValueChange ?? setInternalValue;
    return _jsx(TabsContext.Provider, {
      value: { value, onValueChange: setValue },
      children: _jsx("div", {
        ref: ref,
        className: className,
        ...props,
        children: children,
      }),
    });
  },
);
Tabs.displayName = "Tabs";
export const TabsList = forwardRef(({ className, ...props }, ref) =>
  _jsx("div", {
    ref: ref,
    className: `inline-flex h-11 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400 ${className || ""}`,
    ...props,
  }),
);
TabsList.displayName = "TabsList";
export const TabsTrigger = forwardRef(
  ({ className, value, children, onClick, ...props }, ref) => {
    const context = useContext(TabsContext);
    const isActive = context?.value === value;
    return _jsx("button", {
      ref: ref,
      type: "button",
      className: `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
      } ${className || ""}`,
      onClick: (e) => {
        context?.onValueChange(value);
        onClick?.(e);
      },
      ...props,
      children: children,
    });
  },
);
TabsTrigger.displayName = "TabsTrigger";
export const TabsContent = forwardRef(
  ({ className, value, children, ...props }, ref) => {
    const context = useContext(TabsContext);
    const isActive = context?.value === value;
    if (!isActive) return null;
    return _jsx("div", {
      ref: ref,
      className: `mt-2 ${className || ""}`,
      ...props,
      children: children,
    });
  },
);
TabsContent.displayName = "TabsContent";
