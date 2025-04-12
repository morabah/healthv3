/**
 * Validation utilities for Firebase Functions
 * Provides validation helpers for input data
 */

import { UserType } from "../../../../src/types/enums";
import { logInfo, logWarn } from "../../../../src/lib/logger";

/**
 * Validates an email address format
 * @param email Email address to validate
 * @returns True if email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a phone number format (basic check)
 * @param phone Phone number to validate
 * @returns True if phone is valid, false otherwise
 */
export const isValidPhone = (phone: string | null): boolean => {
  if (phone === null) return true; // Phone can be null
  
  // Basic phone validation - at least 10 digits, allowing for country codes and formatting
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};

/**
 * Validates a password strength
 * @param password Password to validate
 * @returns True if password is valid, false otherwise
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, with at least one uppercase, one lowercase, and one number
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
};

/**
 * Validates a name (first name or last name)
 * @param name Name to validate
 * @returns True if name is valid, false otherwise
 */
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

/**
 * Validates a user type
 * @param userType User type to validate
 * @returns True if user type is valid, false otherwise
 */
export const isValidUserType = (userType: string): boolean => {
  return Object.values(UserType).includes(userType as UserType);
};

/**
 * Validates user registration input data
 * @param data User registration data
 * @returns Object with validation result and errors
 */
export const validateUserRegistration = (data: any): { 
  isValid: boolean; 
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  // Required fields
  if (!data.email) errors.email = 'Email is required';
  if (!data.password) errors.password = 'Password is required';
  if (!data.firstName) errors.firstName = 'First name is required';
  if (!data.lastName) errors.lastName = 'Last name is required';
  if (!data.userType) errors.userType = 'User type is required';
  
  // Field validation
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (data.password && !isValidPassword(data.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
  }
  
  if (data.firstName && !isValidName(data.firstName)) {
    errors.firstName = 'First name must be at least 2 characters';
  }
  
  if (data.lastName && !isValidName(data.lastName)) {
    errors.lastName = 'Last name must be at least 2 characters';
  }
  
  if (data.userType && !isValidUserType(data.userType)) {
    errors.userType = 'Invalid user type';
  }
  
  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }
  
  // User type specific validations
  if (data.userType === UserType.DOCTOR) {
    if (!data.specialty) errors.specialty = 'Specialty is required for doctors';
    if (!data.licenseNumber) errors.licenseNumber = 'License number is required for doctors';
    if (data.yearsOfExperience === undefined) errors.yearsOfExperience = 'Years of experience is required for doctors';
  }
  
  // Log validation results
  if (Object.keys(errors).length > 0) {
    logWarn({
      message: 'User registration validation failed',
      context: 'validation',
      data: { errors }
    });
  } else {
    logInfo({
      message: 'User registration validation passed',
      context: 'validation'
    });
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
