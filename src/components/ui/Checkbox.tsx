/**
 * Checkbox Component
 * An accessible checkbox component with various styles
 */
import React, { forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  error?: string;
  indeterminate?: boolean;
  variant?: 'default' | 'filled';
  fullWidth?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  helperText,
  error,
  indeterminate = false,
  variant = 'default',
  fullWidth = false,
  className = '',
  id,
  ...props
}, ref) => {
  // Handle ref to set indeterminate property
  const innerRef = React.useRef<HTMLInputElement>(null);
  
  // Combine refs
  React.useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  
  // Handle ref forwarding
  const setRefs = (el: HTMLInputElement) => {
    innerRef.current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref) {
      ref.current = el;
    }
  };
  
  // Generate a unique ID if not provided
  const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
  
  // Variant classes
  const variantClasses = {
    default: 'border-gray-300 bg-white',
    filled: 'border-gray-300 bg-gray-100'
  };
  
  // Error state
  const errorClasses = error 
    ? 'border-red-500 focus:ring-red-500' 
    : 'focus:ring-blue-500';
  
  // Width
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={setRefs}
            id={checkboxId}
            type="checkbox"
            className={`
              h-4 w-4 rounded transition-colors
              ${variantClasses[variant]}
              ${errorClasses}
              ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-2 text-sm">
            <label 
              htmlFor={checkboxId} 
              className={`font-medium ${error ? 'text-red-500' : 'text-gray-700'} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {label}
            </label>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${checkboxId}-error`}>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500" id={`${checkboxId}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
