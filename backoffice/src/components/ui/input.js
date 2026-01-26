import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Input stub using Flowbite React
 */
import { TextInput } from "flowbite-react";
import { forwardRef } from "react";
export const Input = forwardRef((props, ref) => {
  return _jsx(TextInput, { ref: ref, ...props });
});
Input.displayName = "Input";
