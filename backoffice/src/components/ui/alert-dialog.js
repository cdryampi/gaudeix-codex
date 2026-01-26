import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, forwardRef } from "react";
const AlertDialogContext = createContext(undefined);
export function AlertDialog({ open: controlledOpen, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (newOpen) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };
  return _jsx(AlertDialogContext.Provider, {
    value: { open, setOpen },
    children: children,
  });
}
export const AlertDialogTrigger = forwardRef(
  ({ children, onClick, asChild, ...props }, ref) => {
    const context = useContext(AlertDialogContext);
    if (!context)
      throw new Error("AlertDialogTrigger must be used within AlertDialog");
    return _jsx("button", {
      ref: ref,
      onClick: (e) => {
        context.setOpen(true);
        onClick?.(e);
      },
      ...props,
      children: children,
    });
  },
);
AlertDialogTrigger.displayName = "AlertDialogTrigger";
export const AlertDialogContent = forwardRef(
  ({ children, className, ...props }, ref) => {
    const context = useContext(AlertDialogContext);
    if (!context)
      throw new Error("AlertDialogContent must be used within AlertDialog");
    if (!context.open) return null;
    return _jsxs("div", {
      className: "relative z-50",
      children: [
        _jsx("div", {
          className:
            "fixed inset-0 bg-gray-950/60 backdrop-blur-[4px] transition-opacity animate-in fade-in duration-300",
          onClick: () => context.setOpen(false),
        }),
        _jsx("div", {
          className: "fixed inset-0 z-50 overflow-y-auto",
          children: _jsx("div", {
            className:
              "flex min-h-full items-center justify-center p-4 text-center sm:p-0",
            children: _jsx("div", {
              ref: ref,
              className: `relative w-full max-w-lg transform overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-2xl transition-all animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 dark:border-gray-800 dark:bg-gray-900 ${className || ""}`,
              onClick: (e) => e.stopPropagation(),
              ...props,
              children: children,
            }),
          }),
        }),
      ],
    });
  },
);
AlertDialogContent.displayName = "AlertDialogContent";
export const AlertDialogHeader = forwardRef(
  ({ children, className, ...props }, ref) =>
    _jsx("div", {
      ref: ref,
      className: `mb-6 flex flex-col space-y-2 text-center sm:text-left ${className || ""}`,
      ...props,
      children: children,
    }),
);
AlertDialogHeader.displayName = "AlertDialogHeader";
export const AlertDialogTitle = forwardRef(({ className, ...props }, ref) =>
  _jsx("h3", {
    ref: ref,
    className: `text-xl font-semibold text-gray-900 dark:text-white ${className || ""}`,
    ...props,
  }),
);
AlertDialogTitle.displayName = "AlertDialogTitle";
export const AlertDialogDescription = forwardRef(
  ({ className, ...props }, ref) =>
    _jsx("p", {
      ref: ref,
      className: `text-base text-gray-500 dark:text-gray-400 ${className || ""}`,
      ...props,
    }),
);
AlertDialogDescription.displayName = "AlertDialogDescription";
export const AlertDialogFooter = forwardRef(
  ({ className, children, ...props }, ref) =>
    _jsx("div", {
      ref: ref,
      className: `mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2 ${className || ""}`,
      ...props,
      children: children,
    }),
);
AlertDialogFooter.displayName = "AlertDialogFooter";
export const AlertDialogAction = forwardRef(
  ({ children, className, onClick, ...props }, ref) => {
    const context = useContext(AlertDialogContext);
    return _jsx("button", {
      ref: ref,
      className: `inline-flex h-10 items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${className || ""}`,
      onClick: (e) => {
        onClick?.(e);
        context?.setOpen(false);
      },
      ...props,
      children: children,
    });
  },
);
AlertDialogAction.displayName = "AlertDialogAction";
export const AlertDialogCancel = forwardRef(
  ({ children, className, onClick, ...props }, ref) => {
    const context = useContext(AlertDialogContext);
    return _jsx("button", {
      ref: ref,
      className: `mt-2 inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 ring-offset-white transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-50 dark:focus:ring-gray-300 sm:mt-0 ${className || ""}`,
      onClick: (e) => {
        onClick?.(e);
        context?.setOpen(false);
      },
      ...props,
      children: children,
    });
  },
);
AlertDialogCancel.displayName = "AlertDialogCancel";
