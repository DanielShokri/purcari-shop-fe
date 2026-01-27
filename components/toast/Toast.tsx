import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Toast as ToastType } from '../../types';
import { useAppDispatch } from '../../store/hooks';
import { removeToast } from '../../store/slices/uiSlice';

interface ToastProps {
  toast: ToastType;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    borderColor: 'border-e-green-500',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  error: {
    icon: XCircle,
    borderColor: 'border-e-red-500',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  info: {
    icon: Info,
    borderColor: 'border-e-blue-500',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-e-amber-500',
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
};

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const dispatch = useAppDispatch();
  const [progress, setProgress] = useState(100);
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const duration = toast.duration || 4000;

  useEffect(() => {
    // Auto-dismiss timer
    const dismissTimer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, duration);

    // Progress bar animation
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    return () => {
      clearTimeout(dismissTimer);
      clearInterval(progressInterval);
    };
  }, [dispatch, toast.id, duration]);

  const handleClose = () => {
    dispatch(removeToast(toast.id));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative w-[320px] sm:w-[360px] bg-white rounded-xl shadow-lg border border-gray-100 border-e-4 ${config.borderColor} overflow-hidden`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          <Icon size={22} />
        </div>
        <p className="flex-grow text-sm text-gray-700 leading-relaxed pt-0.5">
          {toast.message}
        </p>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 -m-1 cursor-pointer"
          aria-label="סגור התראה"
        >
          <X size={18} />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 start-0 end-0 h-1 bg-gray-100">
        <motion.div
          className={`h-full ${config.iconColor.replace('text-', 'bg-')}`}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>
    </motion.div>
  );
};

export default Toast;
