/**
 * Firebase Functions index
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// API Function exports
import { 
  registerUser, 
  updateMyUserProfile, 
  uploadVerificationDocument,
  adminVerifyDoctor,
  findDoctors
} from './api/userFunctions';

import {
  bookAppointment,
  cancelAppointment,
  getMyAppointments,
  getDoctorAvailability,
  setDoctorAvailabilitySlots
} from './api/appointmentFunctions';

import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from './api/notificationFunctions';

// Simple test function
export const helloWorld = functions.https.onCall((data, context) => {
  return {
    message: `Hello from Firebase Functions! Received data: ${JSON.stringify(data)}`
  };
});

// Test registration function - simplified for testing with emulator
export const registerUserTest = functions.https.onCall(async (data, context) => {
  try {
    console.log('Register user test function called with data:', data);
    
    // Validate basic required fields
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields for registration',
        { 
          requiredFields: ['email', 'password', 'firstName', 'lastName'],
          receivedFields: Object.keys(data)
        }
      );
    }
    
    const userType = data.userType || 'PATIENT';
    
    try {
      // Create a mock user record for testing
      const mockUserRecord = {
        uid: `test-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        email: data.email,
        displayName: `${data.firstName} ${data.lastName}`
      };
      
      console.log('Mock user created for testing:', mockUserRecord.uid);
      
      // Return success response
      return {
        success: true,
        userId: mockUserRecord.uid,
        userType,
        message: 'Test user registered successfully (mock)'
      };
    } catch (error) {
      console.error('Error in test registration:', error);
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred during test user registration',
        error
      );
    }
  } catch (error) {
    console.error('Register user test function error:', error);
    throw error;
  }
});

// Export API functions
export {
  registerUser,
  updateMyUserProfile,
  uploadVerificationDocument,
  adminVerifyDoctor,
  findDoctors,
  bookAppointment,
  cancelAppointment,
  getMyAppointments,
  getDoctorAvailability,
  setDoctorAvailabilitySlots,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
