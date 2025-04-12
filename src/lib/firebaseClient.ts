/**
 * Firebase Client SDK Initialization
 * This module initializes and exports Firebase client services for use in the frontend
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';
import { logInfo, logError } from './logger';
import { connectToEmulators } from './firebaseEmulators';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Singleton instances
let firebaseApp: FirebaseApp;
let firebaseAuth: Auth;
let firebaseFirestore: Firestore;
let firebaseStorage: FirebaseStorage;
let firebaseFunctions: Functions;

/**
 * Initialize Firebase if it hasn't been initialized already
 * @returns The Firebase app instance
 */
export const initializeFirebase = (): FirebaseApp => {
  try {
    if (!firebaseApp && getApps().length === 0) {
      logInfo({
        message: 'Initializing Firebase client SDK',
        context: 'firebaseClient',
      });
      
      // Check if required environment variables are set
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        throw new Error('Firebase environment variables are not properly configured');
      }
      
      firebaseApp = initializeApp(firebaseConfig);
      
      // Connect to emulators in development and test environments
      if (process.env.NODE_ENV !== 'production') {
        connectToEmulators();
      }
      
      logInfo({
        message: 'Firebase client SDK initialized successfully',
        context: 'firebaseClient',
        data: { projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID }
      });
    } else if (!firebaseApp) {
      firebaseApp = getApps()[0];
    }
    
    return firebaseApp;
  } catch (error) {
    logError({
      message: 'Failed to initialize Firebase client SDK',
      context: 'firebaseClient',
      data: { error }
    });
    
    throw error;
  }
};

/**
 * Get Firebase Auth instance
 * @returns Firebase Auth instance
 */
export const getFirebaseAuth = (): Auth => {
  if (!firebaseAuth) {
    const app = initializeFirebase();
    firebaseAuth = getAuth(app);
    logInfo({
      message: 'Firebase Auth initialized',
      context: 'firebaseClient'
    });
  }
  return firebaseAuth;
};

/**
 * Get Firebase Firestore instance
 * @returns Firebase Firestore instance
 */
export const getFirebaseFirestore = (): Firestore => {
  if (!firebaseFirestore) {
    const app = initializeFirebase();
    firebaseFirestore = getFirestore(app);
    logInfo({
      message: 'Firebase Firestore initialized',
      context: 'firebaseClient'
    });
  }
  return firebaseFirestore;
};

/**
 * Get Firebase Storage instance
 * @returns Firebase Storage instance
 */
export const getFirebaseStorage = (): FirebaseStorage => {
  if (!firebaseStorage) {
    const app = initializeFirebase();
    firebaseStorage = getStorage(app);
    logInfo({
      message: 'Firebase Storage initialized',
      context: 'firebaseClient'
    });
  }
  return firebaseStorage;
};

/**
 * Get Firebase Functions instance
 * @returns Firebase Functions instance
 */
export const getFirebaseFunctions = (): Functions => {
  if (!firebaseFunctions) {
    const app = initializeFirebase();
    firebaseFunctions = getFunctions(app);
    logInfo({
      message: 'Firebase Functions initialized',
      context: 'firebaseClient'
    });
  }
  return firebaseFunctions;
};

// Initialize Firebase on module load in browser environments
if (typeof window !== 'undefined') {
  try {
    initializeFirebase();
    logInfo({
      message: 'Firebase auto-initialized in browser environment',
      context: 'firebaseClient'
    });
  } catch (error) {
    logError({
      message: 'Error during Firebase auto-initialization',
      context: 'firebaseClient',
      data: { error }
    });
  }
}

// Default export for convenient importing
export default {
  initializeFirebase,
  getFirebaseAuth,
  getFirebaseFirestore,
  getFirebaseStorage,
  getFirebaseFunctions,
};
