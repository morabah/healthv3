/**
 * Firebase Admin SDK initialization
 * Initializes and exports the Firebase Admin SDK for use in Cloud Functions
 */

import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

// Initialize the Firebase Admin SDK if it hasn't been initialized already
if (!admin.apps.length) {
  try {
    logger.log('Initializing Firebase Admin SDK...');
    
    admin.initializeApp();
    
    logger.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
}

// Export the initialized admin instance and commonly used services
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

// Export the admin instance for other uses if needed
export default admin;
