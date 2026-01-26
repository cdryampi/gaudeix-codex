import { ReactNode, HTMLAttributes } from "react";
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}
export declare function Dialog({
  open: controlledOpen,
  onOpenChange,
  children,
}: DialogProps): import("react/jsx-runtime").JSX.Element;
export declare const DialogTrigger: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLButtonElement> &
    import("react").RefAttributes<HTMLButtonElement>
>;
export declare const DialogContent: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLDivElement> & import("react").RefAttributes<HTMLDivElement>
>;
export declare const DialogHeader: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLDivElement> & import("react").RefAttributes<HTMLDivElement>
>;
export declare const DialogTitle: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLHeadingElement> &
    import("react").RefAttributes<HTMLHeadingElement>
>;
export declare const DialogDescription: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLParagraphElement> &
    import("react").RefAttributes<HTMLParagraphElement>
>;
export declare const DialogFooter: import("react").ForwardRefExoticComponent<
  HTMLAttributes<HTMLDivElement> & import("react").RefAttributes<HTMLDivElement>
>;
export {};
