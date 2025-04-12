import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { UserType } from '../../../../src/types/enums';
import { UserProfile } from '../../../../src/types/user';
import { logInfo, logError } from '../../../../src/lib/logger';
import { trackPerformance } from '../../../../src/lib/performance';

/**
 * Creates a new user profile in Firestore
 * @param userId Firebase User ID
 * @param email User's email address
 * @param phone User's phone number (can be null)
 * @param firstName User's first name
 * @param lastName User's last name
 * @param userType Type of user (PATIENT, DOCTOR, ADMIN)
 * @returns Promise resolving to the created user profile
 */
export const createUserProfile = async (
  userId: string,
  email: string,
  phone: string | null,
  firstName: string,
  lastName: string,
  userType: UserType
): Promise<UserProfile> => {
  // Log function start
  logInfo({
    message: 'Creating user profile',
    context: 'userManagement',
    data: { userId, email, phone, firstName, lastName, userType }
  });

  // Track performance
  const perfTracker = trackPerformance('createUserProfile', 'userManagement');

  try {
    // Create timestamp for created/updated fields
    const now = Timestamp.now();

    // Create user profile object
    const userProfile: UserProfile = {
      id: userId,
      email,
      phone,
      firstName,
      lastName,
      userType,
      isActive: false,
      emailVerified: false,
      phoneVerified: false,
      createdAt: now as any, // Type conversion for Firestore Timestamp
      updatedAt: now as any, // Type conversion for Firestore Timestamp
    };

    // Save to Firestore
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .set(userProfile);

    // Log success
    logInfo({
      message: 'User profile created successfully',
      context: 'userManagement',
      data: { userId }
    });

    // Stop performance tracking
    perfTracker.stop({ userId, userType });

    return userProfile;
  } catch (error) {
    // Log error
    logError({
      message: 'Error creating user profile',
      context: 'userManagement',
      data: { userId, error }
    });

    // Stop performance tracking with error info
    perfTracker.stop({ userId, error: true });

    // Re-throw the error for the caller to handle
    throw error;
  }
};

/**
 * Gets a user profile from Firestore by user ID
 * @param userId Firebase User ID
 * @returns Promise resolving to the user profile or null if not found
 */
export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  // Log function start
  logInfo({
    message: 'Getting user profile',
    context: 'userManagement',
    data: { userId }
  });

  // Track performance
  const perfTracker = trackPerformance('getUserProfile', 'userManagement');

  try {
    // Get from Firestore
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    // Check if user exists
    if (!userDoc.exists) {
      // Log user not found
      logInfo({
        message: 'User profile not found',
        context: 'userManagement',
        data: { userId }
      });

      // Stop performance tracking
      perfTracker.stop({ userId, found: false });

      return null;
    }

    // Get user data
    const userData = userDoc.data() as UserProfile;

    // Stop performance tracking
    perfTracker.stop({ userId, found: true });

    return userData;
  } catch (error) {
    // Log error
    logError({
      message: 'Error getting user profile',
      context: 'userManagement',
      data: { userId, error }
    });

    // Stop performance tracking with error info
    perfTracker.stop({ userId, error: true });

    // Re-throw the error for the caller to handle
    throw error;
  }
};
