/**
 * Checkbox stub using Flowbite React
 */
import { Checkbox as FlowbiteCheckbox, CheckboxProps } from "flowbite-react";
import { forwardRef } from "react";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (props, ref) => {
    return <FlowbiteCheckbox ref={ref} {...props} />;
  }
);

Checkbox.displayName = "Checkbox";
