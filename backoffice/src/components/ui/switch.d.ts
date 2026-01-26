import { HTMLAttributes } from "react";
interface SwitchProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}
export declare const Switch: import("react").ForwardRefExoticComponent<
  SwitchProps & import("react").RefAttributes<HTMLDivElement>
>;
export {};
