// Test script for registerUserTest function using Firebase v9 SDK
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

// Test the registerUserTest function
async function testRegisterUser() {
  try {
    console.log('Testing registerUserTest function...');
    
    const registerUserTest = httpsCallable(functions, 'registerUserTest');
    
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
    
    const result = await registerUserTest(patientData);
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
    
    const doctorResult = await registerUserTest(doctorData);
    console.log('Doctor registration successful:', doctorResult.data);
    
  } catch (error) {
    console.error('Error testing registerUserTest function:', error);
  }
}

// Run the test
testRegisterUser()
  .then(() => console.log('Test completed'))
  .catch(error => console.error('Test failed:', error));
