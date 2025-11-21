import { z } from "zod";
interface UseAuthFormProps<T> {
    schema: z.ZodSchema<T>;
    defaultValues: T;
    onSubmit: (data: T) => void;
}
export declare function useAuthForm<T>({ schema, defaultValues, onSubmit, }: UseAuthFormProps<T>): {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    isSubmitting: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
};
export {};
