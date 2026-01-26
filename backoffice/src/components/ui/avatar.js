import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
export const Avatar = forwardRef(({ className, children, ...props }, ref) =>
  _jsx("div", {
    ref: ref,
    className: `relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className || ""}`,
    ...props,
    children: children,
  }),
);
Avatar.displayName = "Avatar";
export const AvatarImage = forwardRef(
  ({ className, src, alt, ...props }, ref) =>
    _jsx("img", {
      ref: ref,
      src: src,
      alt: alt,
      className: `aspect-square h-full w-full ${className || ""}`,
      ...props,
    }),
);
AvatarImage.displayName = "AvatarImage";
export const AvatarFallback = forwardRef(
  ({ className, children, ...props }, ref) =>
    _jsx("div", {
      ref: ref,
      className: `flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 ${className || ""}`,
      ...props,
      children: children,
    }),
);
AvatarFallback.displayName = "AvatarFallback";
