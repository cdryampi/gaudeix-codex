/**
 * Dropdown menu stub - basic implementation
 */
import { HTMLAttributes, forwardRef } from "react";

export const DropdownMenu = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} className="relative inline-block text-left" {...props}>
    {children}
  </div>
));
DropdownMenu.displayName = "DropdownMenu";

export const DropdownMenuTrigger = forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ children, asChild: _asChild, ...props }, ref) => (
    <button ref={ref} {...props}>
      {children}
    </button>
  ),
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { align?: string; forceMount?: boolean }
>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={`absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${className || ""}`}
    {...props}
  >
    <div className="py-1">{children}</div>
  </div>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={`block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${className || ""}`}
    {...props}
  >
    {children}
  </div>
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuLabel = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={`px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase ${className || ""}`}
    {...props}
  >
    {children}
  </div>
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparator = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`my-1 border-t border-gray-200 dark:border-gray-700 ${className || ""}`}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
