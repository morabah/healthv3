/**
 * Radio Component
 * An accessible radio button component with various styles
 */
import React, { forwardRef } from 'react';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  inline?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(({
  options,
  name,
  value,
  onChange,
  label,
  helperText,
  error,
  required = false,
  inline = false,
  fullWidth = false,
  className = ''
}, ref) => {
  // Generate a unique ID for accessibility
  const groupId = React.useId();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div 
      ref={ref}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      role="radiogroup"
      aria-labelledby={label ? `${groupId}-label` : undefined}
      aria-describedby={error ? `${groupId}-error` : helperText ? `${groupId}-helper` : undefined}
    >
      {label && (
        <div 
          id={`${groupId}-label`}
          className={`block text-sm font-medium mb-2 ${error ? 'text-red-500' : 'text-gray-700'}`}
        >
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      
      <div className={`space-${inline ? 'x' : 'y'}-4 ${inline ? 'flex flex-wrap' : ''}`}>
        {options.map((option, index) => {
          const optionId = `${groupId}-option-${index}`;
          return (
            <div 
              key={option.value} 
              className={`flex items-center ${inline ? 'mr-4' : ''}`}
            >
              <input
                id={optionId}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={handleChange}
                disabled={option.disabled}
                className={`
                  h-4 w-4 transition-colors
                  ${error ? 'border-red-500 text-red-600 focus:ring-red-500' : 'border-gray-300 text-blue-600 focus:ring-blue-500'}
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                aria-invalid={error ? 'true' : 'false'}
              />
              <label
                htmlFor={optionId}
                className={`ml-2 block text-sm font-medium ${error ? 'text-red-500' : 'text-gray-700'} ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${groupId}-error`}>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500" id={`${groupId}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
