/**
 * Appointment API Functions
 * Callable functions for appointment-related operations
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Appointment } from '../../../../src/types/appointment';
import { AppointmentStatus } from '../../../../src/types/enums';
import { DoctorAvailabilitySlot } from '../../../../src/types/doctor';
import { createAppointment, updateAppointmentStatus } from '../appointment/appointmentManagement';
import { setDoctorAvailability } from '../user/doctorManagement';
import { logInfo, logError, logWarn } from '../../../../src/lib/logger';
import { trackPerformance } from '../../../../src/lib/performance';

/**
 * Books a new appointment
 * @param data Appointment data
 * @param context Function call context
 * @returns Created appointment
 */
export const bookAppointment = functions.https.onCall(async (data: Partial<Appointment>, context) => {
  // Start performance tracking
  const perfTracker = trackPerformance('bookAppointment', 'functions');
  
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to book an appointment'
      );
    }
    
    // Log function start
    logInfo({
      message: 'Book appointment function called',
      context: 'bookAppointment',
      data: { 
        userId: context.auth.uid,
        doctorId: data.doctorId,
        appointmentDate: data.appointmentDate
      }
    });
    
    // Validate required fields
    if (!data.doctorId || !data.appointmentDate || !data.startTime || !data.endTime) {
      const missingFields = [];
      if (!data.doctorId) missingFields.push('doctorId');
      if (!data.appointmentDate) missingFields.push('appointmentDate');
      if (!data.startTime) missingFields.push('startTime');
      if (!data.endTime) missingFields.push('endTime');
      
      logWarn({
        message: 'Missing required fields for booking appointment',
        context: 'bookAppointment',
        data: { missingFields }
      });
      
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }
    
    // Set the patient ID to the authenticated user
    const appointmentData: Appointment = {
      ...data as any,
      patientId: context.auth.uid,
      status: AppointmentStatus.PENDING,
      createdAt: admin.firestore.Timestamp.now() as any,
      updatedAt: admin.firestore.Timestamp.now() as any
    };
    
    // Create the appointment
    const appointment = await createAppointment(appointmentData);
    
    // Log success
    logInfo({
      message: 'Appointment booked successfully',
      context: 'bookAppointment',
      data: { 
        appointmentId: appointment.id,
        userId: context.auth.uid,
        doctorId: data.doctorId
      }
    });
    
    // Stop performance tracking
    perfTracker.stop({ 
      appointmentId: appointment.id,
      doctorId: data.doctorId
    });
    
    return {
      success: true,
      appointment
    };
  } catch (error: any) {
    // Log error
    logError({
      message: 'Error booking appointment',
      context: 'bookAppointment',
      data: { error }
    });
    
    // Stop performance tracking with error
    perfTracker.stop({ error: true });
    
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An error occurred while booking the appointment',
      error
    );
  }
});

/**
 * Cancels an existing appointment
 * @param data Appointment ID to cancel
 * @param context Function call context
 * @returns Updated appointment
 */
export const cancelAppointment = functions.https.onCall(async (data: { appointmentId: string }, context) => {
  // Start performance tracking
  const perfTracker = trackPerformance('cancelAppointment', 'functions');
  
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to cancel an appointment'
      );
    }
    
    // Log function start
    logInfo({
      message: 'Cancel appointment function called',
      context: 'cancelAppointment',
      data: { 
        userId: context.auth.uid,
        appointmentId: data.appointmentId
      }
    });
    
    // Validate required fields
    if (!data.appointmentId) {
      logWarn({
        message: 'Missing appointment ID for cancellation',
        context: 'cancelAppointment',
        data: { userId: context.auth.uid }
      });
      
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Appointment ID is required'
      );
    }
    
    // Get the appointment to check ownership
    const appointmentRef = admin.firestore().collection('appointments').doc(data.appointmentId);
    const appointmentDoc = await appointmentRef.get();
    
    if (!appointmentDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Appointment not found'
      );
    }
    
    const appointment = appointmentDoc.data() as Appointment;
    
    // Check if user is authorized to cancel this appointment
    if (appointment.patientId !== context.auth.uid && appointment.doctorId !== context.auth.uid) {
      logWarn({
        message: 'Unauthorized attempt to cancel appointment',
        context: 'cancelAppointment',
        data: { 
          userId: context.auth.uid,
          appointmentId: data.appointmentId,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId
        }
      });
      
      throw new functions.https.HttpsError(
        'permission-denied',
        'You are not authorized to cancel this appointment'
      );
    }
    
    // Check if appointment can be cancelled (not already cancelled or completed)
    if (appointment.status === AppointmentStatus.CANCELLED || appointment.status === AppointmentStatus.COMPLETED) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Cannot cancel an appointment that is already ${appointment.status.toLowerCase()}`
      );
    }
    
    // Cancel the appointment
    const cancelledAppointment = await updateAppointmentStatus(
      data.appointmentId,
      AppointmentStatus.CANCELLED,
      `Cancelled by ${appointment.patientId === context.auth.uid ? 'patient' : 'doctor'}`
    );
    
    // Log success
    logInfo({
      message: 'Appointment cancelled successfully',
      context: 'cancelAppointment',
      data: { 
        appointmentId: data.appointmentId,
        userId: context.auth.uid
      }
    });
    
    // Stop performance tracking
    perfTracker.stop({ 
      appointmentId: data.appointmentId
    });
    
    return {
      success: true,
      appointment: cancelledAppointment
    };
  } catch (error: any) {
    // Log error
    logError({
      message: 'Error cancelling appointment',
      context: 'cancelAppointment',
      data: { error }
    });
    
    // Stop performance tracking with error
    perfTracker.stop({ error: true });
    
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An error occurred while cancelling the appointment',
      error
    );
  }
});

/**
 * Gets appointments for the authenticated user
 * @param data Optional filters
 * @param context Function call context
 * @returns List of appointments
 */
export const getMyAppointments = functions.https.onCall(async (data: { status?: AppointmentStatus }, context) => {
  // Start performance tracking
  const perfTracker = trackPerformance('getMyAppointments', 'functions');
  
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to view your appointments'
      );
    }
    
    // Log function start
    logInfo({
      message: 'Get my appointments function called',
      context: 'getMyAppointments',
      data: { 
        userId: context.auth.uid,
        filters: data
      }
    });
    
    // Get user profile to determine role
    const userRef = admin.firestore().collection('users').doc(context.auth.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User profile not found'
      );
    }
    
    const userProfile = userDoc.data();
    const isDoctor = userProfile?.userType === 'DOCTOR';
    const isPatient = userProfile?.userType === 'PATIENT';
    
    // Build query based on user role
    let appointmentsQuery: admin.firestore.Query;
    
    if (isDoctor) {
      appointmentsQuery = admin.firestore().collection('appointments')
        .where('doctorId', '==', context.auth.uid);
    } else if (isPatient) {
      appointmentsQuery = admin.firestore().collection('appointments')
        .where('patientId', '==', context.auth.uid);
    } else {
      // Admin can view all appointments, but we'll still limit to recent ones
      appointmentsQuery = admin.firestore().collection('appointments')
        .orderBy('appointmentDate', 'desc')
        .limit(100);
    }
    
    // Apply status filter if provided
    if (data.status) {
      appointmentsQuery = appointmentsQuery.where('status', '==', data.status);
    }
    
    // Order by appointment date
    appointmentsQuery = appointmentsQuery.orderBy('appointmentDate', 'desc');
    
    // Execute query
    const appointmentsSnapshot = await appointmentsQuery.get();
    const appointments: Appointment[] = [];
    
    appointmentsSnapshot.forEach(doc => {
      const appointment = doc.data() as Appointment;
      appointment.id = doc.id;
      appointments.push(appointment);
    });
    
    // Log success
    logInfo({
      message: 'Appointments retrieved successfully',
      context: 'getMyAppointments',
      data: { 
        userId: context.auth.uid,
        count: appointments.length
      }
    });
    
    // Stop performance tracking
    perfTracker.stop({ 
      count: appointments.length
    });
    
    return {
      success: true,
      appointments
    };
  } catch (error: any) {
    // Log error
    logError({
      message: 'Error retrieving appointments',
      context: 'getMyAppointments',
      data: { error }
    });
    
    // Stop performance tracking with error
    perfTracker.stop({ error: true });
    
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An error occurred while retrieving appointments',
      error
    );
  }
});

/**
 * Gets availability slots for a specific doctor
 * @param data Doctor ID and date
 * @param context Function call context
 * @returns List of availability slots
 */
export const getDoctorAvailability = functions.https.onCall(async (data: { doctorId: string, date?: string }, context) => {
  // Start performance tracking
  const perfTracker = trackPerformance('getDoctorAvailability', 'functions');
  
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to view doctor availability'
      );
    }
    
    // Log function start
    logInfo({
      message: 'Get doctor availability function called',
      context: 'getDoctorAvailability',
      data: { 
        userId: context.auth.uid,
        doctorId: data.doctorId,
        date: data.date
      }
    });
    
    // Validate required fields
    if (!data.doctorId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Doctor ID is required'
      );
    }
    
    // Get doctor availability slots
    const availabilityQuery = admin.firestore()
      .collection('doctorAvailability')
      .where('doctorId', '==', data.doctorId);
    
    const availabilitySnapshot = await availabilityQuery.get();
    const availabilitySlots: DoctorAvailabilitySlot[] = [];
    
    availabilitySnapshot.forEach(doc => {
      const slot = doc.data() as DoctorAvailabilitySlot;
      slot.id = doc.id;
      availabilitySlots.push(slot);
    });
    
    // If date is provided, filter by day of week
    let filteredSlots = availabilitySlots;
    if (data.date) {
      const date = new Date(data.date);
      const dayOfWeek = (date.getDay() + 6) % 7; // Convert Sunday=0 to Sunday=6
      
      filteredSlots = availabilitySlots.filter(slot => 
        slot.dayOfWeek === dayOfWeek && slot.isAvailable
      );
    }
    
    // Get booked appointments for this doctor on this date to check conflicts
    if (data.date) {
      const startOfDay = new Date(data.date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(data.date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const appointmentsQuery = admin.firestore()
        .collection('appointments')
        .where('doctorId', '==', data.doctorId)
        .where('appointmentDate', '>=', admin.firestore.Timestamp.fromDate(startOfDay))
        .where('appointmentDate', '<=', admin.firestore.Timestamp.fromDate(endOfDay))
        .where('status', 'in', [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]);
      
      const appointmentsSnapshot = await appointmentsQuery.get();
      const bookedSlots: { startTime: string, endTime: string }[] = [];
      
      appointmentsSnapshot.forEach(doc => {
        const appointment = doc.data() as Appointment;
        bookedSlots.push({
          startTime: appointment.startTime,
          endTime: appointment.endTime
        });
      });
      
      // Remove slots that conflict with booked appointments
      filteredSlots = filteredSlots.filter(slot => {
        return !bookedSlots.some(bookedSlot => {
          // Check if there's an overlap
          return (slot.startTime < bookedSlot.endTime && slot.endTime > bookedSlot.startTime);
        });
      });
    }
    
    // Log success
    logInfo({
      message: 'Doctor availability retrieved successfully',
      context: 'getDoctorAvailability',
      data: { 
        doctorId: data.doctorId,
        count: filteredSlots.length
      }
    });
    
    // Stop performance tracking
    perfTracker.stop({ 
      doctorId: data.doctorId,
      count: filteredSlots.length
    });
    
    return {
      success: true,
      availabilitySlots: filteredSlots
    };
  } catch (error: any) {
    // Log error
    logError({
      message: 'Error retrieving doctor availability',
      context: 'getDoctorAvailability',
      data: { error }
    });
    
    // Stop performance tracking with error
    perfTracker.stop({ error: true });
    
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An error occurred while retrieving doctor availability',
      error
    );
  }
});

/**
 * Sets availability slots for a doctor
 * @param data Availability slots
 * @param context Function call context
 * @returns Updated availability slots
 */
export const setDoctorAvailabilitySlots = functions.https.onCall(async (data: {
  availabilitySlots: DoctorAvailabilitySlot[]
}, context) => {
  // Start performance tracking
  const perfTracker = trackPerformance('setDoctorAvailabilitySlots', 'functions');
  
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to set availability slots'
      );
    }
    
    // Get user claims
    const userRecord = await admin.auth().getUser(context.auth.uid);
    const userClaims = userRecord.customClaims || {};
    
    // Ensure user is a doctor
    if (userClaims.role !== 'doctor') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only doctors can set availability slots'
      );
    }
    
    // Log function start
    logInfo({
      message: 'Set doctor availability slots function called',
      context: 'setDoctorAvailabilitySlots',
      data: { 
        doctorId: context.auth.uid,
        slotsCount: data.availabilitySlots.length
      }
    });
    
    // Validate input
    if (!data.availabilitySlots || !Array.isArray(data.availabilitySlots) || data.availabilitySlots.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Availability slots are required'
      );
    }
    
    // Ensure all slots belong to the authenticated doctor
    if (context.auth) {
      const invalidSlots = data.availabilitySlots.filter(slot => slot.doctorId !== context.auth!.uid);
      if (invalidSlots.length > 0) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You can only set availability slots for yourself'
        );
      }
    }
    
    // Set the availability slots
    const updatedSlots = await setDoctorAvailability(data.availabilitySlots);
    
    // Log success
    logInfo({
      message: 'Doctor availability set successfully',
      context: 'setDoctorAvailabilitySlots',
      data: { 
        userId: context.auth.uid,
        slotCount: updatedSlots.length
      }
    });
    
    // Stop performance tracking
    perfTracker.stop({ 
      slotCount: updatedSlots.length
    });
    
    return {
      success: true,
      availabilitySlots: updatedSlots
    };
  } catch (error: any) {
    // Log error
    logError({
      message: 'Error setting doctor availability',
      context: 'setDoctorAvailabilitySlots',
      data: { error }
    });
    
    // Stop performance tracking with error
    perfTracker.stop({ error: true });
    
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An error occurred while setting doctor availability',
      error
    );
  }
});
