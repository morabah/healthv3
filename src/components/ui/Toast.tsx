/**
 * Toast Component
 * A toast notification system built with Radix UI
 */
import React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, 
  faCheckCircle, 
  faExclamationTriangle, 
  faExclamationCircle,
  faXmark
} from '@fortawesome/free-solid-svg-icons';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duration?: number;
  className?: string;
}

const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = 'info',
  open,
  onOpenChange,
  duration = 5000,
  className = ''
}) => {
  // Variant classes
  const variantClasses = {
    info: 'bg-blue-100 border-blue-200',
    success: 'bg-green-100 border-green-200',
    warning: 'bg-yellow-100 border-yellow-200',
    error: 'bg-red-100 border-red-200'
  };
  
  // Title color by variant
  const titleColors = {
    info: 'text-blue-800',
    success: 'text-green-800',
    warning: 'text-yellow-800',
    error: 'text-red-800'
  };
  
  // Description color by variant
  const descriptionColors = {
    info: 'text-blue-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    error: 'text-red-700'
  };
  
  // Icon by variant
  const variantIcons = {
    info: faInfoCircle,
    success: faCheckCircle,
    warning: faExclamationTriangle,
    error: faExclamationCircle
  };
  
  // Icon color by variant
  const iconColors = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };

  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      duration={duration}
      className={`
        ${variantClasses[variant]}
        border rounded-lg shadow-lg p-4 flex items-start
        data-[state=open]:animate-in data-[state=closed]:animate-out
        data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0
        data-[state=closed]:slide-out-right-full data-[state=open]:slide-in-right-full
        ${className}
      `}
    >
      <div className="flex-shrink-0 mr-3">
        <FontAwesomeIcon 
          icon={variantIcons[variant]} 
          className={`h-5 w-5 ${iconColors[variant]}`} 
          aria-hidden="true" 
        />
      </div>
      
      <div className="flex-1">
        {title && (
          <ToastPrimitive.Title className={`text-sm font-medium mb-1 ${titleColors[variant]}`}>
            {title}
          </ToastPrimitive.Title>
        )}
        
        {description && (
          <ToastPrimitive.Description className={`text-sm ${descriptionColors[variant]}`}>
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      
      <ToastPrimitive.Close 
        className={`flex-shrink-0 ml-3 ${iconColors[variant]} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${variant === 'info' ? 'blue' : variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : 'red'}-500`}
        aria-label="Close"
      >
        <FontAwesomeIcon 
          icon={faXmark} 
          className="h-5 w-5" 
          aria-hidden="true" 
        />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
};

export interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-full max-w-sm z-50" />
    </ToastPrimitive.Provider>
  );
};

export default Toast;
