import { useState } from "react";
import { ZodError } from "zod";
export function useAuthForm({ schema, defaultValues, onSubmit }) {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      const data = schema.parse(values);
      await onSubmit(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0]] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
}
