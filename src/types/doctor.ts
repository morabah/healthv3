import { Timestamp } from 'firebase/firestore';
import { VerificationStatus } from './enums';

/**
 * Doctor Profile Interface
 * Represents additional doctor-specific data beyond the core UserProfile
 * This interface is used only for users with userType = DOCTOR
 */
export interface DoctorProfile {
  /** Reference to the UserProfile.id this doctor data belongs to */
  userId: string;
  
  /** Doctor's medical specialty (e.g., 'Cardiology', 'Pediatrics') */
  specialty: string;
  
  /** Doctor's professional license number */
  licenseNumber: string;
  
  /** Number of years of professional experience */
  yearsOfExperience: number;
  
  /** Doctor's educational background */
  education: string | null;
  
  /** Professional biography */
  bio: string | null;
  
  /** Current verification status of the doctor */
  verificationStatus: VerificationStatus;
  
  /** Administrative notes regarding verification process */
  verificationNotes: string | null;
  
  /** Doctor's practice location */
  location: string | null;
  
  /** Languages spoken by the doctor */
  languages: string[] | null;
  
  /** Consultation fee amount */
  consultationFee: number | null;
  
  /** URL to the doctor's profile picture */
  profilePictureUrl: string | null;
  
  /** URL to the doctor's license document */
  licenseDocumentUrl: string | null;
  
  /** URL to the doctor's certificates */
  certificateUrl: string | null;
}

/**
 * Doctor Availability Slot Interface
 * Represents a time slot when a doctor is available for appointments
 */
export interface DoctorAvailabilitySlot {
  /** Firestore document ID (optional for new slots) */
  id?: string;
  
  /** Reference to the doctor's UserProfile.id */
  doctorId: string;
  
  /** Day of the week (0 = Monday, 6 = Sunday) */
  dayOfWeek: number;
  
  /** Start time in 'HH:MM' format (24-hour) */
  startTime: string;
  
  /** End time in 'HH:MM' format (24-hour) */
  endTime: string;
  
  /** Whether this slot is currently available */
  isAvailable: boolean;
}

/**
 * Verification Document Interface
 * Represents documents uploaded by doctors for verification purposes
 */
export interface VerificationDocument {
  /** Firestore document ID (optional for new documents) */
  id?: string;
  
  /** Reference to the doctor's UserProfile.id */
  doctorId: string;
  
  /** Type of document (e.g., 'License', 'Certificate', 'Diploma') */
  documentType: string;
  
  /** URL to the uploaded file */
  fileUrl: string;
  
  /** Timestamp when the document was uploaded */
  uploadedAt: Timestamp;
}

/**
 * Creates a new doctor profile with default values
 * @param userId Reference to the UserProfile.id
 * @param data Partial doctor data to initialize with
 * @returns A complete DoctorProfile object with defaults applied
 */
export function createDoctorProfile(
  userId: string,
  data: Partial<Omit<DoctorProfile, 'userId'>> = {}
): DoctorProfile {
  return {
    userId,
    specialty: '',
    licenseNumber: '',
    yearsOfExperience: 0,
    education: null,
    bio: null,
    verificationStatus: VerificationStatus.PENDING,
    verificationNotes: null,
    location: null,
    languages: null,
    consultationFee: null,
    profilePictureUrl: null,
    licenseDocumentUrl: null,
    certificateUrl: null,
    ...data
  };
}

/**
 * Creates a new doctor availability slot with default values
 * @param doctorId Reference to the doctor's UserProfile.id
 * @param data Partial availability data to initialize with
 * @returns A complete DoctorAvailabilitySlot object with defaults applied
 */
export function createDoctorAvailabilitySlot(
  doctorId: string,
  data: Partial<Omit<DoctorAvailabilitySlot, 'doctorId'>> = {}
): DoctorAvailabilitySlot {
  return {
    doctorId,
    dayOfWeek: 0, // Monday by default
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
    ...data
  };
}

/**
 * Creates a new verification document with default values
 * @param doctorId Reference to the doctor's UserProfile.id
 * @param documentType Type of the document
 * @param fileUrl URL to the uploaded file
 * @returns A complete VerificationDocument object
 */
export function createVerificationDocument(
  doctorId: string,
  documentType: string,
  fileUrl: string
): VerificationDocument {
  return {
    doctorId,
    documentType,
    fileUrl,
    uploadedAt: Timestamp.now()
  };
}
