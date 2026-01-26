import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, forwardRef } from "react";
import { X } from "lucide-react";
const DialogContext = createContext(undefined);
export function Dialog({ open: controlledOpen, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (newOpen) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };
  return _jsx(DialogContext.Provider, {
    value: { open, setOpen },
    children: children,
  });
}
export const DialogTrigger = forwardRef(
  ({ children, onClick, ...props }, ref) => {
    const context = useContext(DialogContext);
    if (!context) throw new Error("DialogTrigger must be used within Dialog");
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
DialogTrigger.displayName = "DialogTrigger";
export const DialogContent = forwardRef(
  ({ children, className, ...props }, ref) => {
    const context = useContext(DialogContext);
    if (!context) throw new Error("DialogContent must be used within Dialog");
    if (!context.open) return null;
    return _jsxs("div", {
      className: "relative z-50",
      children: [
        _jsx("div", {
          className:
            "fixed inset-0 bg-gray-950/60 backdrop-blur-[4px] transition-all animate-in fade-in duration-300",
          "aria-hidden": "true",
        }),
        _jsx("div", {
          className: "fixed inset-0 z-50 overflow-y-auto",
          onClick: () => context.setOpen(false),
          children: _jsx("div", {
            className:
              "flex min-h-full items-center justify-center p-4 text-center sm:p-6",
            children: _jsxs("div", {
              ref: ref,
              className: `relative w-full max-w-2xl transform overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-2xl transition-all animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 dark:border-gray-800 dark:bg-gray-900 ${className || ""}`,
              onClick: (e) => {
                // VERY IMPORTANT: Stop propagation so clicks inside the modal don't close it
                e.stopPropagation();
              },
              ...props,
              children: [
                _jsxs("button", {
                  type: "button",
                  className:
                    "absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300",
                  onClick: (e) => {
                    e.stopPropagation();
                    context.setOpen(false);
                  },
                  children: [
                    _jsx(X, { className: "h-4 w-4", strokeWidth: 2.5 }),
                    _jsx("span", { className: "sr-only", children: "Close" }),
                  ],
                }),
                _jsx("div", { className: "p-6 sm:p-8", children: children }),
              ],
            }),
          }),
        }),
      ],
    });
  },
);
DialogContent.displayName = "DialogContent";
export const DialogHeader = forwardRef(
  ({ children, className, ...props }, ref) =>
    _jsx("div", {
      ref: ref,
      className: `mb-6 flex flex-col space-y-2 text-center sm:text-left ${className || ""}`,
      ...props,
      children: children,
    }),
);
DialogHeader.displayName = "DialogHeader";
export const DialogTitle = forwardRef(({ className, ...props }, ref) =>
  _jsx("h3", {
    ref: ref,
    className: `text-xl font-semibold leading-none tracking-tight text-gray-900 dark:text-white ${className || ""}`,
    ...props,
  }),
);
DialogTitle.displayName = "DialogTitle";
export const DialogDescription = forwardRef(({ className, ...props }, ref) =>
  _jsx("p", {
    ref: ref,
    className: `text-base text-gray-500 dark:text-gray-400 ${className || ""}`,
    ...props,
  }),
);
DialogDescription.displayName = "DialogDescription";
export const DialogFooter = forwardRef(
  ({ className, children, ...props }, ref) =>
    _jsx("div", {
      ref: ref,
      className: `mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2 ${className || ""}`,
      ...props,
      children: children,
    }),
);
DialogFooter.displayName = "DialogFooter";
