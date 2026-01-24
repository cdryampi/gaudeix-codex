import {
  createContext,
  useContext,
  useState,
  forwardRef,
  ReactNode,
  HTMLAttributes,
} from "react";

interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextValue | undefined>(undefined);

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function AlertDialog({ open: controlledOpen, onOpenChange, children }: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  const setOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

export const AlertDialogTrigger = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ children, onClick, asChild, ...props }, ref) => {
    const context = useContext(AlertDialogContext);
    if (!context) throw new Error("AlertDialogTrigger must be used within AlertDialog");

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
  }
);
AlertDialogTrigger.displayName = "AlertDialogTrigger";

export const AlertDialogContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    const context = useContext(AlertDialogContext);
    if (!context) throw new Error("AlertDialogContent must be used within AlertDialog");

    if (!context.open) return null;

    return (
      <div className="relative z-50">
        {/* Backdrop - Increased blur and darkness */}
        <div 
          className="fixed inset-0 bg-gray-950/60 backdrop-blur-[4px] transition-opacity animate-in fade-in duration-300"
          onClick={() => context.setOpen(false)}
        />
        
        {/* Scroll Container */}
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Modal Panel - Premium styles: rounded-2xl, deep shadow */}
            <div
              ref={ref}
              className={`relative w-full max-w-lg transform overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-2xl transition-all animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 dark:border-gray-800 dark:bg-gray-900 ${className || ""}`}
              onClick={(e) => e.stopPropagation()}
              {...props}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
AlertDialogContent.displayName = "AlertDialogContent";

export const AlertDialogHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={`mb-6 flex flex-col space-y-2 text-center sm:text-left ${className || ""}`} {...props}>
      {children}
    </div>
  )
);
AlertDialogHeader.displayName = "AlertDialogHeader";

export const AlertDialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={`text-xl font-semibold text-gray-900 dark:text-white ${className || ""}`} {...props} />
  )
);
AlertDialogTitle.displayName = "AlertDialogTitle";

export const AlertDialogDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={`text-base text-gray-500 dark:text-gray-400 ${className || ""}`} {...props} />
  )
);
AlertDialogDescription.displayName = "AlertDialogDescription";

export const AlertDialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2 ${className || ""}`} {...props}>
      {children}
    </div>
  )
);
AlertDialogFooter.displayName = "AlertDialogFooter";

export const AlertDialogAction = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
  ({ children, className, onClick, ...props }, ref) => {
    const context = useContext(AlertDialogContext);
    return (
      <button
        ref={ref}
        className={`inline-flex h-10 items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${className || ""}`}
        onClick={(e) => {
          onClick?.(e);
          context?.setOpen(false);
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
AlertDialogAction.displayName = "AlertDialogAction";

export const AlertDialogCancel = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
  ({ children, className, onClick, ...props }, ref) => {
    const context = useContext(AlertDialogContext);
    return (
      <button
        ref={ref}
        className={`mt-2 inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 ring-offset-white transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-50 dark:focus:ring-gray-300 sm:mt-0 ${className || ""}`}
        onClick={(e) => {
          onClick?.(e);
          context?.setOpen(false);
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
AlertDialogCancel.displayName = "AlertDialogCancel";
