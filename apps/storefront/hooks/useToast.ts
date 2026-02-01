import { toaster } from '../components/ui';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface UseToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  closable?: boolean;
}

/**
 * Custom hook to show toast notifications using Chakra UI v3
 * Provides a simple interface for showing success, error, warning, info, and loading toasts
 *
 * @example
 * const toast = useToast();
 * toast.success({ title: 'Success!', description: 'Operation completed' });
 * toast.error({ title: 'Error', description: 'Something went wrong' });
 */
export const useToast = () => {
  const show = (options: UseToastOptions) => {
    const { title, description, type = 'info', duration = 3000, closable = true } = options;
    
    toaster.create({
      title,
      description,
      type,
      duration,
      closable,
    });
  };

  return {
    success: (options: Omit<UseToastOptions, 'type'>) =>
      show({ ...options, type: 'success' }),
    error: (options: Omit<UseToastOptions, 'type'>) =>
      show({ ...options, type: 'error' }),
    warning: (options: Omit<UseToastOptions, 'type'>) =>
      show({ ...options, type: 'warning' }),
    info: (options: Omit<UseToastOptions, 'type'>) =>
      show({ ...options, type: 'info' }),
    loading: (options: Omit<UseToastOptions, 'type'>) =>
      show({ ...options, type: 'loading' }),
    show,
  };
};
