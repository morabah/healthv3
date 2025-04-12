import { getApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

/**
 * Connect to Firebase emulators in development and test environments
 */
export const connectToEmulators = () => {
  try {
    // Only connect to emulators in development or test environment
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    const app = getApp();
    
    // Auth emulator
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    
    // Firestore emulator
    const firestore = getFirestore(app);
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    
    // Functions emulator
    const functions = getFunctions(app);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    
    // Storage emulator
    const storage = getStorage(app);
    connectStorageEmulator(storage, 'localhost', 9199);
    
    console.log('Connected to Firebase emulators');
  } catch (error) {
    console.error('Error connecting to Firebase emulators:', error);
  }
};

/**
 * Helper function to check if emulators are running
 */
export const areEmulatorsRunning = async (): Promise<boolean> => {
  try {
    // Try to connect to the Emulator UI
    const response = await fetch('http://localhost:4000');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};
