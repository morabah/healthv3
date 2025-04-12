/**
 * Textarea Component
 * A versatile textarea component with various styles and states
 */
import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  rows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  helperText,
  error,
  fullWidth = false,
  variant = 'default',
  rows = 4,
  maxLength,
  showCharacterCount = false,
  className = '',
  id,
  value = '',
  ...props
}, ref) => {
  // Generate a unique ID if not provided
  const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
  
  // Base classes
  const baseClasses = 'block w-full transition-colors focus:outline-none focus:ring-2';
  
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
  
  // Combine all classes for textarea
  const textareaClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${errorClasses}
    ${widthClasses}
    ${props.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
    px-4 py-2 text-base
    ${className}
  `;

  // Character count
  const currentLength = value?.toString().length || 0;

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={textareaId} 
          className={`block text-sm font-medium mb-1 ${error ? 'text-red-500' : 'text-gray-700'}`}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        className={textareaClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        value={value}
        {...props}
      />
      
      {/* Character count and error/helper text */}
      <div className="mt-1 flex justify-between">
        <div>
          {error && (
            <p className="text-sm text-red-600" id={`${textareaId}-error`}>
              {error}
            </p>
          )}
          
          {helperText && !error && (
            <p className="text-sm text-gray-500" id={`${textareaId}-helper`}>
              {helperText}
            </p>
          )}
        </div>
        
        {showCharacterCount && maxLength && (
          <p className={`text-xs ${currentLength >= maxLength ? 'text-red-500' : 'text-gray-500'}`}>
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
