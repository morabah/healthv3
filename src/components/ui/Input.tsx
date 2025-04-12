/**
 * Input Component
 * A versatile input component with various styles and states
 */
import React, { forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: IconDefinition;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  variant = 'default',
  className = '',
  id,
  ...props
}, ref) => {
  // Generate a unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  // Base classes
  const baseClasses = 'block transition-colors focus:outline-none focus:ring-2';
  
  // Variant classes
  const variantClasses = {
    default: 'border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500',
    filled: 'bg-gray-100 border border-transparent rounded-md focus:bg-white focus:border-blue-500 focus:ring-blue-500',
    outlined: 'bg-transparent border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500'
  };
  
  // Error state
  const errorClasses = error 
    ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
    : '';
  
  // Width
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Icon padding
  const iconPaddingClasses = icon 
    ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') 
    : '';
  
  // Combine all classes for input
  const inputClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${errorClasses}
    ${widthClasses}
    ${iconPaddingClasses}
    ${props.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
    px-4 py-2 text-base
    ${className}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className={`block text-sm font-medium mb-1 ${error ? 'text-red-500' : 'text-gray-700'}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon 
              icon={icon} 
              className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} 
              aria-hidden="true" 
            />
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FontAwesomeIcon 
              icon={icon} 
              className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} 
              aria-hidden="true" 
            />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${inputId}-error`}>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500" id={`${inputId}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
