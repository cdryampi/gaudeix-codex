import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  forwardRef,
  ReactNode,
  HTMLAttributes,
} from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  labelMap: Map<string, ReactNode>;
  registerLabel: (value: string, label: ReactNode) => void;
  rootRef: React.RefObject<HTMLDivElement>;
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export const Select = ({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
}: SelectProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const labelMap = useRef(new Map<string, ReactNode>()).current;
  const rootRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState(0); // Force re-render when labels update

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
    setOpen(false);
  };

  const registerLabel = (val: string, label: ReactNode) => {
    if (labelMap.get(val) !== label) {
      labelMap.set(val, label);
      // Debounce updates slightly or allow initial render
      setTimeout(() => forceUpdate((n) => n + 1), 0);
    }
  };

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen,
        labelMap,
        registerLabel,
        rootRef,
      }}
    >
      <div ref={rootRef} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement>
>(({ children, className, ...props }, ref) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within Select");

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={`flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500/40 ${
        className || ""
      }`}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50 dark:text-gray-300" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = forwardRef<
  HTMLSpanElement,
  { placeholder?: string; children?: ReactNode }
>(({ placeholder, children }, ref) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within Select");

  const selectedLabel =
    context.value !== undefined && context.value !== null
      ? context.labelMap.get(context.value)
      : null;

  return (
    <span ref={ref} className="block truncate">
      {children || selectedLabel || (
        <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
      )}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

export const SelectContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const context = useContext(SelectContext);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!context?.open) return;
      const root = context.rootRef.current;
      if (root && !root.contains(event.target as Node)) {
        context.setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!context?.open) return;
      if (event.key === "Escape") context.setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [context]);

  if (!context?.open) return null;

  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm animate-in fade-in zoom-in-95 duration-100 ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

export const SelectItem = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { value: string }
>(({ children, className, value, ...props }, ref) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within Select");

  const isSelected = context.value === value;

  // Register label for display
  useEffect(() => {
    context.registerLabel(value, children);
  }, [value, children, context]);

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        context.onValueChange?.(value);
      }}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
        isSelected
          ? "font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-primary-900/30"
          : "text-gray-700 dark:text-gray-200"
      } ${className || ""}`}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-primary-600 dark:text-primary-400">
          <Check className="h-4 w-4" />
        </span>
      )}
      <span className="block truncate">{children}</span>
    </div>
  );
});
SelectItem.displayName = "SelectItem";
