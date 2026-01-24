/**
 * Input stub using Flowbite React
 */
import { TextInput, TextInputProps } from "flowbite-react";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, TextInputProps>(
  (props, ref) => {
    return <TextInput ref={ref} {...props} />;
  }
);

Input.displayName = "Input";
