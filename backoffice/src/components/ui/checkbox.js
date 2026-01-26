import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Checkbox stub using Flowbite React
 */
import { Checkbox as FlowbiteCheckbox } from "flowbite-react";
import { forwardRef } from "react";
export const Checkbox = forwardRef((props, ref) => {
  return _jsx(FlowbiteCheckbox, { ref: ref, ...props });
});
Checkbox.displayName = "Checkbox";
