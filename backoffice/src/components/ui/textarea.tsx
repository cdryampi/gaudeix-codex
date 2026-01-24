/**
 * Textarea stub using Flowbite React
 */
import { Textarea as FlowbiteTextarea, TextareaProps } from "flowbite-react";
import { forwardRef } from "react";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    return <FlowbiteTextarea ref={ref} {...props} />;
  }
);

Textarea.displayName = "Textarea";
