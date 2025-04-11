import { Timestamp } from 'firebase/firestore';

/**
 * Patient Profile Interface
 * Represents additional patient-specific data beyond the core UserProfile
 * This interface is used only for users with userType = PATIENT
 */
export interface PatientProfile {
  /** Reference to the UserProfile.id this patient data belongs to */
  userId: string;
  
  /** Patient's date of birth */
  dateOfBirth: Timestamp | null;
  
  /** Patient's gender (e.g., 'Male', 'Female', 'Other', etc.) */
  gender: string | null;
  
  /** Patient's blood type (e.g., 'A+', 'O-', etc.) */
  bloodType: string | null;
  
  /** Patient's medical history notes */
  medicalHistory: string | null;
}

/**
 * Creates a new patient profile with default values
 * @param userId Reference to the UserProfile.id
 * @param data Partial patient data to initialize with
 * @returns A complete PatientProfile object with defaults applied
 */
export function createPatientProfile(
  userId: string,
  data: Partial<Omit<PatientProfile, 'userId'>> = {}
): PatientProfile {
  return {
    userId,
    dateOfBirth: null,
    gender: null,
    bloodType: null,
    medicalHistory: null,
    ...data
  };
}
