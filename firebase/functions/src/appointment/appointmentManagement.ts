import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { Appointment } from '../../../../src/types/appointment';
import { AppointmentStatus } from '../../../../src/types/enums';
import { logInfo, logError } from '../../../../src/lib/logger';
import { trackPerformance } from '../../../../src/lib/performance';

/**
 * Creates a new appointment in Firestore
 * @param data Appointment data
 * @returns Promise resolving to the created appointment
 */
export const createAppointment = async (
  data: Appointment
): Promise<Appointment> => {
  // Log function start
  logInfo({
    message: 'Creating appointment',
    context: 'appointmentManagement',
    data: { patientId: data.patientId, doctorId: data.doctorId, appointmentDate: data.appointmentDate }
  });

  // Track performance
  const perfTracker = trackPerformance('createAppointment', 'appointmentManagement');

  try {
    // Validate required fields
    if (!data.patientId || !data.doctorId || !data.appointmentDate || !data.startTime || !data.endTime) {
      throw new Error('patientId, doctorId, appointmentDate, startTime, and endTime are required for appointment');
    }

    // Set timestamps if not provided
    const now = Timestamp.now();
    const appointmentWithTimestamps = {
      ...data,
      status: data.status || AppointmentStatus.PENDING,
      createdAt: data.createdAt || now as any,
      updatedAt: data.updatedAt || now as any
    };

    // Create document reference
    const appointmentRef = admin.firestore().collection('appointments').doc();
    const appointmentWithId = { ...appointmentWithTimestamps, id: appointmentRef.id };

    // Save to Firestore
    await appointmentRef.set(appointmentWithId);

    // Log success
    logInfo({
      message: 'Appointment created successfully',
      context: 'appointmentManagement',
      data: { appointmentId: appointmentRef.id }
    });

    // Stop performance tracking
    perfTracker.stop({ appointmentId: appointmentRef.id });

    return appointmentWithId;
  } catch (error) {
    // Log error
    logError({
      message: 'Error creating appointment',
      context: 'appointmentManagement',
      data: { patientId: data.patientId, doctorId: data.doctorId, error }
    });

    // Stop performance tracking with error info
    perfTracker.stop({ error: true });

    // Re-throw the error for the caller to handle
    throw error;
  }
};

/**
 * Updates the status of an existing appointment
 * @param appointmentId Appointment ID
 * @param status New appointment status
 * @param notes Optional notes about the status change
 * @returns Promise resolving to the updated appointment
 */
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  notes?: string
): Promise<Appointment> => {
  // Log function start
  logInfo({
    message: 'Updating appointment status',
    context: 'appointmentManagement',
    data: { appointmentId, status, notes }
  });

  // Track performance
  const perfTracker = trackPerformance('updateAppointmentStatus', 'appointmentManagement');

  try {
    // Get reference to the appointment document
    const appointmentRef = admin.firestore().collection('appointments').doc(appointmentId);
    
    // Get current appointment data
    const appointmentDoc = await appointmentRef.get();
    
    if (!appointmentDoc.exists) {
      throw new Error(`Appointment with ID ${appointmentId} not found`);
    }
    
    // Create updates object
    const updates: Partial<Appointment> = {
      status,
      updatedAt: Timestamp.now() as any
    };
    
    // Add notes if provided
    if (notes !== undefined) {
      updates.notes = notes;
    }
    
    // Update the document
    await appointmentRef.update(updates);
    
    // Get the updated appointment
    const updatedAppointmentDoc = await appointmentRef.get();
    const updatedAppointment = updatedAppointmentDoc.data() as Appointment;
    
    // Log success
    logInfo({
      message: 'Appointment status updated successfully',
      context: 'appointmentManagement',
      data: { appointmentId, status }
    });
    
    // Stop performance tracking
    perfTracker.stop({ appointmentId, status });
    
    return updatedAppointment;
  } catch (error) {
    // Log error
    logError({
      message: 'Error updating appointment status',
      context: 'appointmentManagement',
      data: { appointmentId, status, error }
    });
    
    // Stop performance tracking with error info
    perfTracker.stop({ appointmentId, error: true });
    
    // Re-throw the error for the caller to handle
    throw error;
  }
};
