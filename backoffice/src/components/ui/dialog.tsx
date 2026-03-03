import {
  createContext,
  useContext,
  useState,
  useEffect,
  forwardRef,
  ReactNode,
  HTMLAttributes,
} from "react";
import { X } from "lucide-react";

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({
  open: controlledOpen,
  onOpenChange,
  children,
}: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (newOpen: boolean) => {
    if (!isControlled) setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export const DialogTrigger = forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogTrigger must be used within Dialog");

  return (
    <button
      ref={ref}
      onClick={(e) => {
        context.setOpen(true);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
});
DialogTrigger.displayName = "DialogTrigger";

export const DialogContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogContent must be used within Dialog");

  useEffect(() => {
    if (!context.open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") context.setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [context]);

  if (!context.open) return null;

  return (
    <div className="relative z-50" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-gray-950/60 backdrop-blur-[4px] transition-all animate-in fade-in duration-300"
        aria-hidden="true"
        onClick={() => context.setOpen(false)}
      />

      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        onClick={() => context.setOpen(false)}
      >
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
          <div
            ref={ref}
            className={`relative w-full max-w-2xl transform overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-2xl transition-all animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 dark:border-gray-800 dark:bg-gray-900 ${className || ""}`}
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                context.setOpen(false);
              }}
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
              <span className="sr-only">Close</span>
            </button>

            <div className="p-6 sm:p-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
});
DialogContent.displayName = "DialogContent";

export const DialogHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={`mb-6 flex flex-col space-y-2 text-center sm:text-left ${className || ""}`}
    {...props}
  >
    {children}
  </div>
));
DialogHeader.displayName = "DialogHeader";

export const DialogTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-xl font-semibold leading-none tracking-tight text-gray-900 dark:text-white ${className || ""}`}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-base text-gray-500 dark:text-gray-400 ${className || ""}`}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export const DialogFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2 ${className || ""}`}
    {...props}
  >
    {children}
  </div>
));
DialogFooter.displayName = "DialogFooter";
