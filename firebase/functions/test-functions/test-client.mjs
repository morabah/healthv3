// Test script for simplified test functions using Firebase v9 SDK
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

// Initialize Firebase with emulator configuration
const firebaseConfig = {
  projectId: 'health-appointment-system-dev',
  apiKey: 'fake-api-key-for-emulator'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

// Connect to emulators with updated ports
connectAuthEmulator(auth, 'http://localhost:9099');
connectFunctionsEmulator(functions, 'localhost', 5002);

// Test the simplePing function
async function testPingFunction() {
  try {
    console.log('Testing simplePing function...');
    
    const simplePing = httpsCallable(functions, 'simplePing');
    
    // Test data
    const testData = {
      name: 'Test User',
      message: 'This is a simple test'
    };
    
    console.log('Sending test data:', testData);
    
    const result = await simplePing(testData);
    console.log('simplePing successful:', result.data);
    
  } catch (error) {
    console.error('Error testing simplePing function:', error);
  }
}

// Test the registerUserSimple function
async function testSimpleRegisterUser() {
  try {
    console.log('Testing registerUserSimple function...');
    
    const registerUserSimple = httpsCallable(functions, 'registerUserSimple');
    
    // Test data for a patient registration
    const patientData = {
      email: 'testpatient@example.com',
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'Patient',
      userType: 'PATIENT'
    };
    
    console.log('Sending patient registration data:', patientData);
    
    const result = await registerUserSimple(patientData);
    console.log('Simple registration successful:', result.data);
    
  } catch (error) {
    console.error('Error testing registerUserSimple function:', error);
  }
}

// Run the tests
console.log('Starting simplified function tests...');

// Run ping test first
await testPingFunction();

// Then run simple user registration test
await testSimpleRegisterUser();

console.log('Tests completed');
