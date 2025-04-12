/**
 * Badge Component
 * A versatile badge component for displaying status indicators and counts
 */
import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  pill?: boolean;
  outline?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = true,
  pill = false,
  outline = false,
  className = ''
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium';
  
  // Size classes
  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };
  
  // Variant classes (solid)
  const solidVariantClasses = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-cyan-100 text-cyan-800',
    light: 'bg-white text-gray-600',
    dark: 'bg-gray-700 text-white'
  };
  
  // Variant classes (outline)
  const outlineVariantClasses = {
    primary: 'bg-transparent border border-blue text-blue',
    secondary: 'bg-transparent border border-gray text-gray',
    success: 'bg-transparent border border-green text-green',
    danger: 'bg-transparent border border-red text-red',
    warning: 'bg-transparent border border-yellow text-yellow',
    info: 'bg-transparent border border-cyan text-cyan',
    light: 'bg-transparent border border-gray-300 text-gray-600',
    dark: 'bg-transparent border border-gray-700 text-gray-700'
  };
  
  // Shape classes
  const shapeClasses = pill ? 'rounded-full' : rounded ? 'rounded' : '';
  
  // Combine all classes
  const badgeClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${outline ? outlineVariantClasses[variant] : solidVariantClasses[variant]}
    ${shapeClasses}
    ${className}
  `;

  return (
    <span className={badgeClasses}>
      {children}
    </span>
  );
};

export default Badge;
