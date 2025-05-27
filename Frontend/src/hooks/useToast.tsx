/**
 * @file useToast Hook
 * @description Custom hook for managing toast notifications
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  ToastProvider, 
  ToastViewport, 
  Toast, 
  ToastTitle, 
  ToastDescription 
} from '../components/ui/toast';

// Types
type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastData {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastData[];
  showToast: (data: Omit<ToastData, 'id'>) => void;
  dismissToast: (id: string) => void;
}

// Default context
const ToastContext = createContext<ToastContextType>({
  toasts: [],
  showToast: () => {},
  dismissToast: () => {},
});

// Toast colors based on type
const toastTypeStyles = {
  info: 'border-blue-200 bg-blue-50',
  success: 'border-green-200 bg-green-50',
  warning: 'border-yellow-200 bg-yellow-50',
  error: 'border-red-200 bg-red-50',
};

// Toast title colors based on type
const toastTitleStyles = {
  info: 'text-blue-800',
  success: 'text-green-800',
  warning: 'text-yellow-800',
  error: 'text-red-800',
};

// Toast description colors based on type
const toastDescriptionStyles = {
  info: 'text-blue-700',
  success: 'text-green-700',
  warning: 'text-yellow-700',
  error: 'text-red-700',
};

/**
 * Toast Provider Component
 */
export const ToastContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Show a new toast
  const showToast = (data: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { ...data, id }]);
  };

  // Dismiss a toast by ID
  const dismissToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Auto-dismiss toasts after their duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dismissToast(toast.id);
      }, toast.duration || 5000); // Default 5 seconds

      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      <ToastProvider>
        {children}
        <ToastViewport />
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            className={toastTypeStyles[toast.type]}
            onOpenChange={(open) => {
              if (!open) dismissToast(toast.id);
            }}
          >
            <div className="grid gap-1">
              {toast.title && (
                <ToastTitle className={toastTitleStyles[toast.type]}>
                  {toast.title}
                </ToastTitle>
              )}
              <ToastDescription className={toastDescriptionStyles[toast.type]}>
                {toast.message}
              </ToastDescription>
            </div>
          </Toast>
        ))}
      </ToastProvider>
    </ToastContext.Provider>
  );
};

/**
 * Hook to use the toast context
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastContextProvider');
  }
  
  return context;
};
