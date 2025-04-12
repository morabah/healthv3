/**
 * Select Component
 * An accessible select component built with Radix UI
 */
import React, { forwardRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  helperText,
  error,
  disabled = false,
  required = false,
  fullWidth = false,
  className = ''
}, ref) => {
  // Generate a unique ID for accessibility
  const id = React.useId();
  
  const handleValueChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-sm font-medium mb-1 ${error ? 'text-red-500' : 'text-gray-700'}`}
        >
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <SelectPrimitive.Root
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          ref={ref}
          id={id}
          className={`
            flex items-center justify-between w-full px-4 py-2 text-base
            border rounded-md shadow-sm transition-colors
            ${error 
              ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
            ${fullWidth ? 'w-full' : ''}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <FontAwesomeIcon 
              icon={faChevronDown} 
              className="h-4 w-4 text-gray-400" 
              aria-hidden="true" 
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="overflow-hidden bg-white rounded-md border border-gray-200 shadow-lg z-50"
            position="popper"
            sideOffset={5}
            align="start"
            side="bottom"
          >
            <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 rotate-180" />
            </SelectPrimitive.ScrollUpButton>
            
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={`
                    relative flex items-center px-8 py-2 text-sm rounded-md cursor-default select-none outline-none
                    data-[disabled]:text-gray-400 data-[disabled]:pointer-events-none
                    data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700
                    data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-700
                  `}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                    <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            
            <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500" id={`${id}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
