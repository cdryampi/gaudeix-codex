/**
 * Form stub - basic form components using react-hook-form
 */
import { HTMLAttributes, forwardRef } from "react";
import { Label } from "./label";

export const Form = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const FormField = ({
  render,
}: {
  control?: unknown;
  name: string;
  render: (props: { field: Record<string, unknown> }) => React.ReactNode;
}) => {
  return render({ field: {} });
};

export const FormItem = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={`space-y-2 ${className || ""}`} {...props} />
));
FormItem.displayName = "FormItem";

export const FormLabel = Label;

export const FormControl = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => <div ref={ref} {...props} />);
FormControl.displayName = "FormControl";

export const FormDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-500 dark:text-gray-400 ${className || ""}`}
    {...props}
  />
));
FormDescription.displayName = "FormDescription";

export const FormMessage = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  if (!children) return null;
  return (
    <p
      ref={ref}
      role="alert"
      className={`text-sm text-red-600 dark:text-red-500 ${className || ""}`}
      {...props}
    >
      {children}
    </p>
  );
});
FormMessage.displayName = "FormMessage";
