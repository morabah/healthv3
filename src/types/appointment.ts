import { Timestamp } from 'firebase/firestore';
import { AppointmentStatus } from './enums';

/**
 * Appointment Interface
 * Represents a scheduled appointment between a patient and a doctor
 */
export interface Appointment {
  /** Firestore document ID (optional for new appointments) */
  id?: string;
  
  /** Reference to the patient's UserProfile.id */
  patientId: string;
  
  /** Reference to the doctor's UserProfile.id */
  doctorId: string;
  
  /** Date of the appointment */
  appointmentDate: Timestamp;
  
  /** Start time in 'HH:MM' format (24-hour) */
  startTime: string;
  
  /** End time in 'HH:MM' format (24-hour) */
  endTime: string;
  
  /** Current status of the appointment */
  status: AppointmentStatus;
  
  /** Patient's reason for the appointment */
  reason: string | null;
  
  /** Doctor's notes after the appointment */
  notes: string | null;
  
  /** Timestamp when the appointment was created */
  createdAt: Timestamp;
  
  /** Timestamp when the appointment was last updated */
  updatedAt: Timestamp;
  
  // Denormalized fields for easier display
  
  /** Patient's full name (denormalized) */
  patientName?: string;
  
  /** Doctor's full name (denormalized) */
  doctorName?: string;
  
  /** Doctor's specialty (denormalized) */
  doctorSpecialty?: string;
}

/**
 * Creates a new appointment with default values
 * @param patientId Reference to the patient's UserProfile.id
 * @param doctorId Reference to the doctor's UserProfile.id
 * @param appointmentDate Date of the appointment
 * @param startTime Start time in 'HH:MM' format
 * @param endTime End time in 'HH:MM' format
 * @param data Additional partial appointment data
 * @returns A complete Appointment object with defaults applied
 */
export function createAppointment(
  patientId: string,
  doctorId: string,
  appointmentDate: Timestamp,
  startTime: string,
  endTime: string,
  data: Partial<Omit<Appointment, 'patientId' | 'doctorId' | 'appointmentDate' | 'startTime' | 'endTime' | 'createdAt' | 'updatedAt'>> = {}
): Appointment {
  const now = Timestamp.now();
  
  return {
    patientId,
    doctorId,
    appointmentDate,
    startTime,
    endTime,
    status: AppointmentStatus.PENDING,
    reason: null,
    notes: null,
    createdAt: now,
    updatedAt: now,
    ...data
  };
}

/**
 * Updates an existing appointment
 * @param appointment The existing appointment to update
 * @param updates Partial updates to apply
 * @returns A new Appointment object with updates applied
 */
export function updateAppointment(
  appointment: Appointment,
  updates: Partial<Omit<Appointment, 'id' | 'patientId' | 'doctorId' | 'createdAt'>> = {}
): Appointment {
  return {
    ...appointment,
    ...updates,
    updatedAt: Timestamp.now()
  };
}
