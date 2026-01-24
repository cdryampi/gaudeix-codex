/**
 * Label stub using Flowbite React
 */
import { Label as FlowbiteLabel, LabelProps } from "flowbite-react";
import { forwardRef } from "react";

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (props, ref) => {
    return <FlowbiteLabel ref={ref} {...props} />;
  }
);

Label.displayName = "Label";
