/**
 * Integration Test Setup
 * Configures Firebase Functions Test SDK to work with Firebase Emulator Suite
 */
import * as admin from 'firebase-admin';
import functionsTest from 'firebase-functions-test';

// Initialize the Firebase Functions Test SDK with emulator settings
const projectId = 'health-appointment-system-test';
const testEnv = functionsTest({
  projectId,
});

// Set environment variables for emulator usage
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
process.env.FUNCTIONS_EMULATOR = 'true';

// Initialize Firebase Admin SDK with the emulator configuration
admin.initializeApp({
  projectId,
  // No credential needed when using emulators
});

// Export the test environment and admin SDK for use in tests
export { testEnv, admin };

// Helper function to create a test user with authentication context
export const createAuthUser = (uid: string, email: string, customClaims?: Record<string, any>) => {
  return {
    auth: {
      uid,
      token: {
        email,
        email_verified: true,
        ...customClaims
      }
    }
  };
};

// Helper function to clean up Firestore collections after tests
export const cleanupFirestore = async (collections: string[]) => {
  for (const collection of collections) {
    const snapshot = await admin.firestore().collection(collection).get();
    const batch = admin.firestore().batch();
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    if (snapshot.docs.length > 0) {
      await batch.commit();
    }
  }
};
