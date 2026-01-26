import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Switch stub using Flowbite React
 */
import { ToggleSwitch } from "flowbite-react";
import { forwardRef } from "react";
export const Switch = forwardRef(
  (
    { checked = false, onCheckedChange, disabled, className, ...props },
    ref,
  ) => {
    return _jsx("div", {
      ref: ref,
      className: `inline-flex items-center ${className || ""}`,
      ...props,
      children: _jsx(ToggleSwitch, {
        checked: checked,
        disabled: disabled,
        label: "",
        onChange: (checked) => {
          if (onCheckedChange) {
            onCheckedChange(checked);
          }
        },
      }),
    });
  },
);
Switch.displayName = "Switch";
