/**
 * Tooltip stub using Flowbite React
 */
import { Tooltip as FlowbiteTooltip } from "flowbite-react";
import { forwardRef, ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
}

export const TooltipProvider = ({ children }: { children: ReactNode }) => <>{children}</>;

export const Tooltip = ({ children, content }: TooltipProps) => (
  <FlowbiteTooltip content={content}>{children}</FlowbiteTooltip>
);

export const TooltipTrigger = forwardRef<HTMLDivElement, { children: ReactNode; asChild?: boolean }>(
  ({ children }, ref) => <div ref={ref}>{children}</div>
);
TooltipTrigger.displayName = "TooltipTrigger";

export const TooltipContent = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref) => <div ref={ref}>{children}</div>
);
TooltipContent.displayName = "TooltipContent";
