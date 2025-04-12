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
import { mockAuth, mockFunctions, mockStorage } from './mockFirebase';

// Enable testing mode with mock implementations
// Set this to false to use real Firebase services
const USE_MOCK_FIREBASE = process.env.NEXT_PUBLIC_USE_MOCK_FIREBASE === 'true' || false;

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATegnW0o6bC6NOB6OtsZI501p8_Jy5isw",
  authDomain: "helathcare-331f1.firebaseapp.com",
  projectId: "helathcare-331f1",
  storageBucket: "helathcare-331f1.appspot.com",
  messagingSenderId: "662603978873",
  appId: "1:662603978873:web:4b8102a82647b334419ca8",
  measurementId: "G-LN6HZTXH2R"
};

// Singleton instances
let firebaseApp: FirebaseApp;
let firebaseAuth: Auth;
let firebaseFirestore: Firestore;
let firebaseStorage: FirebaseStorage;
let firebaseFunctions: Functions;

// Flag to track if we're using mock Firebase config
let usingMockConfig = false;
let usingMockImplementation = false;

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
      
      // Check if we should use mock implementation for testing
      if (USE_MOCK_FIREBASE) {
        usingMockImplementation = true;
        logInfo({
          message: 'Using mock Firebase implementation for testing',
          context: 'firebaseClient',
        });
        
        // For mock implementation, we still initialize the app but won't use the services
        firebaseApp = initializeApp(firebaseConfig);
        return firebaseApp;
      }
      
      firebaseApp = initializeApp(firebaseConfig);
      
      // Connect to emulators in development and test environments
      if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
        connectToEmulators();
      }
      
      logInfo({
        message: 'Firebase client SDK initialized successfully',
        context: 'firebaseClient',
        data: { 
          projectId: firebaseConfig.projectId,
          usingMockConfig,
          usingMockImplementation
        }
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
  if (usingMockImplementation || USE_MOCK_FIREBASE) {
    logInfo({
      message: 'Using mock Firebase Auth for testing',
      context: 'firebaseClient'
    });
    return mockAuth as unknown as Auth;
  }
  
  if (!firebaseAuth) {
    const app = initializeFirebase();
    firebaseAuth = getAuth(app);
    logInfo({
      message: 'Firebase Auth initialized',
      context: 'firebaseClient',
      data: { usingMockConfig }
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
      context: 'firebaseClient',
      data: { usingMockConfig }
    });
  }
  return firebaseFirestore;
};

/**
 * Get Firebase Storage instance
 * @returns Firebase Storage instance
 */
export const getFirebaseStorage = (): FirebaseStorage => {
  if (usingMockImplementation || USE_MOCK_FIREBASE) {
    logInfo({
      message: 'Using mock Firebase Storage for testing',
      context: 'firebaseClient'
    });
    return mockStorage as unknown as FirebaseStorage;
  }
  
  if (!firebaseStorage) {
    const app = initializeFirebase();
    firebaseStorage = getStorage(app);
    logInfo({
      message: 'Firebase Storage initialized',
      context: 'firebaseClient',
      data: { usingMockConfig }
    });
  }
  return firebaseStorage;
};

/**
 * Get Firebase Functions instance
 * @returns Firebase Functions instance
 */
export const getFirebaseFunctions = (): Functions => {
  if (usingMockImplementation || USE_MOCK_FIREBASE) {
    logInfo({
      message: 'Using mock Firebase Functions for testing',
      context: 'firebaseClient'
    });
    return mockFunctions as unknown as Functions;
  }
  
  if (!firebaseFunctions) {
    const app = initializeFirebase();
    firebaseFunctions = getFunctions(app);
    logInfo({
      message: 'Firebase Functions initialized',
      context: 'firebaseClient',
      data: { usingMockConfig }
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
