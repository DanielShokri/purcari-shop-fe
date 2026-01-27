import { useAppDispatch } from '../hooks';
import { showToast } from '../slices/uiSlice';

/**
 * Custom hook for showing toast notifications
 * Usage:
 *   const toast = useToast();
 *   toast.success('המוצר נוסף לסל');
 *   toast.error('משהו השתבש');
 */
export const useToast = () => {
  const dispatch = useAppDispatch();

  return {
    success: (message: string, duration?: number) => 
      dispatch(showToast({ type: 'success', message, duration })),
    
    error: (message: string, duration?: number) => 
      dispatch(showToast({ type: 'error', message, duration })),
    
    info: (message: string, duration?: number) => 
      dispatch(showToast({ type: 'info', message, duration })),
    
    warning: (message: string, duration?: number) => 
      dispatch(showToast({ type: 'warning', message, duration })),
  };
};

export default useToast;
