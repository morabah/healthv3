/**
 * Spinner Component
 * A versatile loading spinner with various sizes and colors
 */
import React from 'react';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  className?: string;
  label?: string;
  labelPosition?: 'left' | 'right' | 'top' | 'bottom';
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
  label,
  labelPosition = 'right'
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-500',
    info: 'text-cyan-500',
    light: 'text-gray-300',
    dark: 'text-gray-800'
  };
  
  // Label size classes
  const labelSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };
  
  // Label position classes
  const labelPositionClasses = {
    left: 'flex-row-reverse space-x-reverse space-x-2',
    right: 'flex-row space-x-2',
    top: 'flex-col-reverse space-y-reverse space-y-2',
    bottom: 'flex-col space-y-2'
  };
  
  // Combine spinner classes
  const spinnerClasses = `
    inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;
  
  // If no label, just return the spinner
  if (!label) {
    return (
      <div 
        className={spinnerClasses}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
  
  // With label, return spinner and label in a container
  return (
    <div 
      className={`inline-flex items-center justify-center ${labelPositionClasses[labelPosition]}`}
      role="status"
    >
      <div className={spinnerClasses}>
        <span className="sr-only">Loading...</span>
      </div>
      <span className={`${labelSizeClasses[size]} ${variantClasses[variant]}`}>
        {label}
      </span>
    </div>
  );
};

export default Spinner;
