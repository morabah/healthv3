import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { PatientProfile } from '../../../../src/types/patient';
import { logInfo, logError } from '../../../../src/lib/logger';
import { trackPerformance } from '../../../../src/lib/performance';

/**
 * Creates a new patient profile in Firestore
 * @param data Patient profile data
 * @returns Promise resolving to the created patient profile
 */
export const createPatientProfile = async (
  data: PatientProfile
): Promise<PatientProfile> => {
  // Log function start
  logInfo({
    message: 'Creating patient profile',
    context: 'patientManagement',
    data: { userId: data.userId }
  });

  // Track performance
  const perfTracker = trackPerformance('createPatientProfile', 'patientManagement');

  try {
    // Validate required fields
    if (!data.userId) {
      throw new Error('userId is required for patient profile');
    }

    // Save to Firestore
    await admin.firestore()
      .collection('patients')
      .doc(data.userId)
      .set(data);

    // Log success
    logInfo({
      message: 'Patient profile created successfully',
      context: 'patientManagement',
      data: { userId: data.userId }
    });

    // Stop performance tracking
    perfTracker.stop({ userId: data.userId });

    return data;
  } catch (error) {
    // Log error
    logError({
      message: 'Error creating patient profile',
      context: 'patientManagement',
      data: { userId: data.userId, error }
    });

    // Stop performance tracking with error info
    perfTracker.stop({ userId: data.userId, error: true });

    // Re-throw the error for the caller to handle
    throw error;
  }
};
