/**
 * Button component - Custom implementation with Tailwind CSS
 * Direct Tailwind classes for better visibility and control
 */
import { ButtonHTMLAttributes } from "react";
export interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}
export declare const Button: import("react").ForwardRefExoticComponent<
  CustomButtonProps & import("react").RefAttributes<HTMLButtonElement>
>;
