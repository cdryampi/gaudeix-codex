import { ReactNode, HTMLAttributes } from "react";
interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}
export declare function AlertDialog({
  open: controlledOpen,
  onOpenChange,
  children,
}: AlertDialogProps): import("react/jsx-runtime").JSX.Element;
export declare const AlertDialogTrigger: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  } & import("react").RefAttributes<HTMLButtonElement>
>;
export declare const AlertDialogContent: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLDivElement> & import("react").RefAttributes<HTMLDivElement>
>;
export declare const AlertDialogHeader: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLDivElement> & import("react").RefAttributes<HTMLDivElement>
>;
export declare const AlertDialogTitle: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLHeadingElement> &
    import("react").RefAttributes<HTMLHeadingElement>
>;
export declare const AlertDialogDescription: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLParagraphElement> &
    import("react").RefAttributes<HTMLParagraphElement>
>;
export declare const AlertDialogFooter: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLDivElement> & import("react").RefAttributes<HTMLDivElement>
>;
export declare const AlertDialogAction: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLButtonElement> &
    import("react").RefAttributes<HTMLButtonElement>
>;
export declare const AlertDialogCancel: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLButtonElement> &
    import("react").RefAttributes<HTMLButtonElement>
>;
export {};
