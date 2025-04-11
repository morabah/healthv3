import { Timestamp } from 'firebase/firestore';
import { UserType } from './enums';

/**
 * User Profile Interface
 * Represents the core user data structure in the Health Appointment System
 * This interface is used for all user types (patients, doctors, admins)
 */
export interface UserProfile {
  /** Firebase User ID (UID) */
  id: string;
  
  /** User's email address, can be null if user registered with phone only */
  email: string | null;
  
  /** User's phone number, can be null if user registered with email only */
  phone: string | null;
  
  /** User's first name */
  firstName: string;
  
  /** User's last name */
  lastName: string;
  
  /** Type of user (PATIENT, DOCTOR, ADMIN) */
  userType: UserType;
  
  /** Whether the user account is active */
  isActive: boolean;
  
  /** Whether the user's email has been verified */
  emailVerified: boolean;
  
  /** Whether the user's phone number has been verified */
  phoneVerified: boolean;
  
  /** Timestamp when the user was created */
  createdAt: Timestamp;
  
  /** Timestamp when the user was last updated */
  updatedAt: Timestamp;
}

/**
 * Creates a new user profile with default values
 * @param id Firebase User ID
 * @param data Partial user data to initialize with
 * @returns A complete UserProfile object with defaults applied
 */
export function createUserProfile(
  id: string, 
  data: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>
): UserProfile {
  const now = Timestamp.now();
  
  return {
    id,
    email: null,
    phone: null,
    firstName: '',
    lastName: '',
    userType: UserType.PATIENT, // Default to PATIENT
    isActive: false,
    emailVerified: false,
    phoneVerified: false,
    createdAt: now,
    updatedAt: now,
    ...data
  };
}
