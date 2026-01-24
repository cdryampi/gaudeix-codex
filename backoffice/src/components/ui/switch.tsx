/**
 * Switch stub using Flowbite React
 */
import { ToggleSwitch } from "flowbite-react";
import { forwardRef, HTMLAttributes } from "react";

interface SwitchProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch = forwardRef<HTMLDivElement, SwitchProps>(
  ({ checked = false, onCheckedChange, disabled, className, ...props }, ref) => {
    return (
      <div ref={ref} className={`inline-flex items-center ${className || ""}`} {...props}>
        <ToggleSwitch
          checked={checked}
          disabled={disabled}
          label=""
          onChange={(checked: boolean) => {
            if (onCheckedChange) {
              onCheckedChange(checked);
            }
          }}
        />
      </div>
    );
  }
);

Switch.displayName = "Switch";
