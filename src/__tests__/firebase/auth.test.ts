/**
 * Firebase Authentication Tests
 * Tests basic authentication functionality using Firebase emulators
 */
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { connectAuthEmulator } from 'firebase/auth';

// Test firebase config (using emulators)
const testFirebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test-project.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456789',
};

describe('Firebase Authentication', () => {
  let auth: any;
  
  beforeAll(() => {
    // Initialize Firebase for testing
    const app = initializeApp(testFirebaseConfig, 'auth-test');
    auth = getAuth(app);
    
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  });
  
  beforeEach(async () => {
    // Sign out before each test to ensure a clean state
    await signOut(auth).catch(() => {});
  });
  
  it('should create a new user account', async () => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!';
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    expect(userCredential.user).toBeDefined();
    expect(userCredential.user.email).toBe(email);
  });
  
  it('should sign in with email and password', async () => {
    // Create a test user first
    const email = `signin-test-${Date.now()}@example.com`;
    const password = 'Test123!';
    
    await createUserWithEmailAndPassword(auth, email, password);
    await signOut(auth);
    
    // Now try to sign in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    expect(userCredential.user).toBeDefined();
    expect(userCredential.user.email).toBe(email);
  });
  
  it('should reject sign in with incorrect password', async () => {
    const email = `failed-signin-${Date.now()}@example.com`;
    const password = 'Test123!';
    
    // Create the user first
    await createUserWithEmailAndPassword(auth, email, password);
    await signOut(auth);
    
    // Try to sign in with wrong password
    await expect(
      signInWithEmailAndPassword(auth, email, 'WrongPassword123!')
    ).rejects.toThrow();
  });
});
