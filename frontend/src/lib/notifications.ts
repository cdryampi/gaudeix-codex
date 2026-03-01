import { toast } from 'sonner';

export const notifications = {
  success: (message: string, options?: any) => toast.success(message, options),
  error: (message: string, options?: any) => toast.error(message, options),
  loading: (message: string, options?: any) => toast.loading(message, options),
  dismiss: (id?: string | number) => toast.dismiss(id),
};
