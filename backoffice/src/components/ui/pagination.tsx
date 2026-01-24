/**
 * Pagination stub - basic implementation
 */
import { Pagination as FlowbitePagination } from "flowbite-react";
import { forwardRef, HTMLAttributes } from "react";

interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  page?: number;  // Compatibility
  currentPage?: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  ({ page, currentPage, totalPages, onPageChange, className, ...props }, ref) => {
    const activePage = page || currentPage || 1;
    return (
      <div ref={ref} className={`flex justify-center ${className || ""}`} {...props}>
        <FlowbitePagination
          currentPage={activePage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          showIcons
        />
      </div>
    );
  }
);
Pagination.displayName = "Pagination";

export const PaginationContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`flex items-center gap-1 ${className || ""}`} {...props} />
  )
);
PaginationContent.displayName = "PaginationContent";

export const PaginationItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
  )
);
PaginationItem.displayName = "PaginationItem";

export const PaginationLink = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement> & { isActive?: boolean }>(
  ({ isActive, className, ...props }, ref) => (
    <button
      ref={ref}
      className={`px-3 py-1 rounded ${isActive ? "bg-primary-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"} ${className || ""}`}
      {...props}
    />
  )
);
PaginationLink.displayName = "PaginationLink";

export const PaginationPrevious = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={`px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 ${className || ""}`}
      {...props}
    >
      {children || "Anterior"}
    </button>
  )
);
PaginationPrevious.displayName = "PaginationPrevious";

export const PaginationNext = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={`px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 ${className || ""}`}
      {...props}
    >
      {children || "Siguiente"}
    </button>
  )
);
PaginationNext.displayName = "PaginationNext";
