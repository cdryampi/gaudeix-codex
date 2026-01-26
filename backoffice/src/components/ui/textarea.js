import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Textarea stub using Flowbite React
 */
import { Textarea as FlowbiteTextarea } from "flowbite-react";
import { forwardRef } from "react";
export const Textarea = forwardRef((props, ref) => {
  return _jsx(FlowbiteTextarea, { ref: ref, ...props });
});
Textarea.displayName = "Textarea";
