import { ReactNode, HTMLAttributes } from "react";
interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}
export declare const Select: ({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
}: SelectProps) => import("react/jsx-runtime").JSX.Element;
export declare const SelectTrigger: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLButtonElement> &
    import("react").RefAttributes<HTMLButtonElement>
>;
export declare const SelectValue: import("react").ForwardRefExoticComponent<
  {
    placeholder?: string;
    children?: ReactNode;
  } & import("react").RefAttributes<HTMLSpanElement>
>;
export declare const SelectContent: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLDivElement> & import("react").RefAttributes<HTMLDivElement>
>;
export declare const SelectItem: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLDivElement> & {
    value: string;
  } & import("react").RefAttributes<HTMLDivElement>
>;
export {};
