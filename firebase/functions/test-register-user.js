// Test script for registerUser function using Firebase v9 SDK
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

// Connect to emulators
connectAuthEmulator(auth, 'http://localhost:9099');
connectFunctionsEmulator(functions, 'localhost', 5001);

// Test the registerUser function
async function testRegisterUser() {
  try {
    console.log('Testing registerUser function...');
    
    const registerUser = httpsCallable(functions, 'registerUser');
    
    // Test data for a patient registration
    const patientData = {
      email: 'testpatient@example.com',
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'Patient',
      phone: '+15551234567',
      userType: 'PATIENT',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
      address: '123 Test Street, Test City'
    };
    
    console.log('Sending patient registration data:', patientData);
    
    const result = await registerUser(patientData);
    console.log('Registration successful:', result.data);
    
    // Test data for a doctor registration
    const doctorData = {
      email: 'testdoctor@example.com',
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'Doctor',
      phone: '+15557654321',
      userType: 'DOCTOR',
      specialty: 'Cardiology',
      licenseNumber: 'MD12345',
      yearsOfExperience: 10
    };
    
    console.log('Sending doctor registration data:', doctorData);
    
    const doctorResult = await registerUser(doctorData);
    console.log('Doctor registration successful:', doctorResult.data);
    
  } catch (error) {
    console.error('Error testing registerUser function:', error);
  }
}

// Run the test
testRegisterUser()
  .then(() => console.log('Test completed'))
  .catch(error => console.error('Test failed:', error));
