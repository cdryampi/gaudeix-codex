/**
 * Alert stub using Flowbite React
 */
import { Alert as FlowbiteAlert } from "flowbite-react";
import { HTMLAttributes, forwardRef } from "react";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    const color = variant === "destructive" ? "failure" : "info";

    return (
      <FlowbiteAlert ref={ref} color={color} className={className} {...props}>
        {children}
      </FlowbiteAlert>
    );
  }
);
Alert.displayName = "Alert";

export const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={`text-sm ${className || ""}`} {...props} />
  )
);
AlertDescription.displayName = "AlertDescription";

export const AlertTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={`mb-1 font-medium leading-none tracking-tight ${className || ""}`} {...props} />
  )
);
AlertTitle.displayName = "AlertTitle";
