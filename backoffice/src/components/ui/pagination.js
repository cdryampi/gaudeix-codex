import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Pagination stub - basic implementation
 */
import { Pagination as FlowbitePagination } from "flowbite-react";
import { forwardRef } from "react";
export const Pagination = forwardRef(
  (
    { page, currentPage, totalPages, onPageChange, className, ...props },
    ref,
  ) => {
    const activePage = page || currentPage || 1;
    return _jsx("div", {
      ref: ref,
      className: `flex justify-center ${className || ""}`,
      ...props,
      children: _jsx(FlowbitePagination, {
        currentPage: activePage,
        totalPages: totalPages,
        onPageChange: onPageChange,
        showIcons: true,
      }),
    });
  },
);
Pagination.displayName = "Pagination";
export const PaginationContent = forwardRef(({ className, ...props }, ref) =>
  _jsx("div", {
    ref: ref,
    className: `flex items-center gap-1 ${className || ""}`,
    ...props,
  }),
);
PaginationContent.displayName = "PaginationContent";
export const PaginationItem = forwardRef(({ className, ...props }, ref) =>
  _jsx("div", { ref: ref, className: className, ...props }),
);
PaginationItem.displayName = "PaginationItem";
export const PaginationLink = forwardRef(
  ({ isActive, className, ...props }, ref) =>
    _jsx("button", {
      ref: ref,
      className: `px-3 py-1 rounded ${isActive ? "bg-primary-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"} ${className || ""}`,
      ...props,
    }),
);
PaginationLink.displayName = "PaginationLink";
export const PaginationPrevious = forwardRef(
  ({ className, children, ...props }, ref) =>
    _jsx("button", {
      ref: ref,
      className: `px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 ${className || ""}`,
      ...props,
      children: children || "Anterior",
    }),
);
PaginationPrevious.displayName = "PaginationPrevious";
export const PaginationNext = forwardRef(
  ({ className, children, ...props }, ref) =>
    _jsx("button", {
      ref: ref,
      className: `px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 ${className || ""}`,
      ...props,
      children: children || "Siguiente",
    }),
);
PaginationNext.displayName = "PaginationNext";
