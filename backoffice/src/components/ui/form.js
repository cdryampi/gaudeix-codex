import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
/**
 * Form stub - basic form components using react-hook-form
 */
import { forwardRef } from "react";
import { Label } from "./label";
export const Form = ({ children }) => {
  return _jsx(_Fragment, { children: children });
};
export const FormField = ({ render }) => {
  return render({ field: {} });
};
export const FormItem = forwardRef(({ className, ...props }, ref) =>
  _jsx("div", {
    ref: ref,
    className: `space-y-2 ${className || ""}`,
    ...props,
  }),
);
FormItem.displayName = "FormItem";
export const FormLabel = Label;
export const FormControl = forwardRef(({ ...props }, ref) =>
  _jsx("div", { ref: ref, ...props }),
);
FormControl.displayName = "FormControl";
export const FormDescription = forwardRef(({ className, ...props }, ref) =>
  _jsx("p", {
    ref: ref,
    className: `text-sm text-gray-500 dark:text-gray-400 ${className || ""}`,
    ...props,
  }),
);
FormDescription.displayName = "FormDescription";
export const FormMessage = forwardRef(
  ({ className, children, ...props }, ref) => {
    if (!children) return null;
    return _jsx("p", {
      ref: ref,
      className: `text-sm text-red-600 dark:text-red-500 ${className || ""}`,
      ...props,
      children: children,
    });
  },
);
FormMessage.displayName = "FormMessage";
