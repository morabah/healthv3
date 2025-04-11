/**
 * Enumerations for the Health Appointment System
 * These enums provide type safety for various status and type fields throughout the application
 */

/**
 * User types in the system
 * PATIENT - Regular users who book appointments
 * DOCTOR - Healthcare providers who receive appointments
 * ADMIN - System administrators with elevated privileges
 */
export enum UserType {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

/**
 * Verification status for users (particularly doctors)
 * PENDING - Initial state, awaiting verification
 * VERIFIED - Successfully verified
 * REJECTED - Verification was rejected
 */
export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

/**
 * Appointment status tracking
 * PENDING - Initial state when appointment is created
 * CONFIRMED - Appointment has been confirmed by the doctor
 * CANCELLED - Appointment has been cancelled by either party
 * COMPLETED - Appointment has been completed
 */
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}
