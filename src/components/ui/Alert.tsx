/**
 * Alert Component
 * A versatile alert component for displaying notifications and messages
 */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, 
  faCheckCircle, 
  faExclamationTriangle, 
  faExclamationCircle,
  faXmark
} from '@fortawesome/free-solid-svg-icons';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: AlertVariant;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  // Variant classes
  const variantClasses = {
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200'
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
  
  // Combine all classes
  const alertClasses = `
    flex items-start p-4 border rounded-lg
    ${variantClasses[variant]}
    ${className}
  `;

  return (
    <div 
      className={alertClasses}
      role="alert"
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
          <h3 className="text-sm font-medium mb-1">
            {title}
          </h3>
        )}
        <div className="text-sm">
          {children}
        </div>
      </div>
      
      {dismissible && onDismiss && (
        <button
          type="button"
          className={`flex-shrink-0 ml-3 ${iconColors[variant]} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${variant === 'info' ? 'blue' : variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : 'red'}-500`}
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <FontAwesomeIcon 
            icon={faXmark} 
            className="h-5 w-5" 
            aria-hidden="true" 
          />
        </button>
      )}
    </div>
  );
};

export default Alert;
