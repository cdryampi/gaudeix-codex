import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
/**
 * Tooltip stub using Flowbite React
 */
import { Tooltip as FlowbiteTooltip } from "flowbite-react";
import { forwardRef } from "react";
export const TooltipProvider = ({ children }) =>
  _jsx(_Fragment, { children: children });
export const Tooltip = ({ children, content }) =>
  _jsx(FlowbiteTooltip, { content: content, children: children });
export const TooltipTrigger = forwardRef(({ children }, ref) =>
  _jsx("div", { ref: ref, children: children }),
);
TooltipTrigger.displayName = "TooltipTrigger";
export const TooltipContent = forwardRef(({ children }, ref) =>
  _jsx("div", { ref: ref, children: children }),
);
TooltipContent.displayName = "TooltipContent";
