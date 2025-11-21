import { useState } from "react";
import { z, ZodError } from "zod";

interface UseAuthFormProps<T> {
  schema: z.ZodSchema<T>;
  defaultValues: T;
  onSubmit: (data: T) => void;
}

export function useAuthForm<T>({
  schema,
  defaultValues,
  onSubmit,
}: UseAuthFormProps<T>) {
  const [values, setValues] = useState<T>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof T]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const data = schema.parse(values);
      await onSubmit(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Partial<Record<keyof T, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as keyof T] = err.message;
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
