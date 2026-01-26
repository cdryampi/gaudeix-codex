import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Table stub - basic HTML table with Flowbite styling
 */
import { forwardRef } from "react";
export const Table = forwardRef(({ className, ...props }, ref) =>
  _jsx("div", {
    className: "relative overflow-x-auto",
    children: _jsx("table", {
      ref: ref,
      className: `w-full text-sm text-left text-gray-500 dark:text-gray-400 ${className || ""}`,
      ...props,
    }),
  }),
);
Table.displayName = "Table";
export const TableHeader = forwardRef(({ className, ...props }, ref) =>
  _jsx("thead", {
    ref: ref,
    className: `text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 ${className || ""}`,
    ...props,
  }),
);
TableHeader.displayName = "TableHeader";
export const TableBody = forwardRef(({ className, ...props }, ref) =>
  _jsx("tbody", { ref: ref, className: className, ...props }),
);
TableBody.displayName = "TableBody";
export const TableFooter = forwardRef(({ className, ...props }, ref) =>
  _jsx("tfoot", {
    ref: ref,
    className: `bg-gray-50 dark:bg-gray-700 ${className || ""}`,
    ...props,
  }),
);
TableFooter.displayName = "TableFooter";
export const TableRow = forwardRef(({ className, ...props }, ref) =>
  _jsx("tr", {
    ref: ref,
    className: `bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${className || ""}`,
    ...props,
  }),
);
TableRow.displayName = "TableRow";
export const TableHead = forwardRef(({ className, ...props }, ref) =>
  _jsx("th", { ref: ref, className: `px-6 py-3 ${className || ""}`, ...props }),
);
TableHead.displayName = "TableHead";
export const TableCell = forwardRef(({ className, ...props }, ref) =>
  _jsx("td", { ref: ref, className: `px-6 py-4 ${className || ""}`, ...props }),
);
TableCell.displayName = "TableCell";
export const TableCaption = forwardRef(({ className, ...props }, ref) =>
  _jsx("caption", {
    ref: ref,
    className: `text-sm text-gray-500 dark:text-gray-400 ${className || ""}`,
    ...props,
  }),
);
TableCaption.displayName = "TableCaption";
