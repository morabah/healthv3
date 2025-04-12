/**
 * Card Component
 * A versatile card component for displaying content in a structured way
 */
import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  rounded = true,
  hoverable = false,
  clickable = false,
  onClick
}) => {
  // Base classes
  const baseClasses = 'bg-white transition-all';
  
  // Variant classes
  const variantClasses = {
    default: 'border border-gray-200',
    bordered: 'border-2 border-gray-300',
    elevated: 'shadow-md border border-gray-100'
  };
  
  // Padding classes
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8'
  };
  
  // Rounded
  const roundedClasses = rounded ? 'rounded-lg' : '';
  
  // Hover effect
  const hoverClasses = hoverable ? 'hover:shadow-lg hover:-translate-y-1' : '';
  
  // Clickable
  const clickableClasses = clickable ? 'cursor-pointer' : '';
  
  // Combine all classes
  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${roundedClasses}
    ${hoverClasses}
    ${clickableClasses}
    ${className}
  `;

  return (
    <div 
      className={cardClasses}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  divider?: boolean;
}> = ({ 
  children, 
  className = '',
  divider = false
}) => {
  return (
    <div className={`${divider ? 'border-b border-gray-200 pb-4 mb-4' : ''} ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ 
  children, 
  className = ''
}) => {
  return (
    <h3 className={`text-lg font-medium text-gray-900 ${className}`}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ 
  children, 
  className = ''
}) => {
  return (
    <p className={`text-sm text-gray-500 ${className}`}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ 
  children, 
  className = ''
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  divider?: boolean;
}> = ({ 
  children, 
  className = '',
  divider = false
}) => {
  return (
    <div className={`${divider ? 'border-t border-gray-200 pt-4 mt-4' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
