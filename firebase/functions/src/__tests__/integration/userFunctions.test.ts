/**
 * Integration Tests for User Functions
 * Tests the HTTPS Callable Functions in userFunctions.ts
 */
import { testEnv, admin, createAuthUser, cleanupFirestore } from './setup';
import { UserType, VerificationStatus } from '../../../../../src/types/enums';

// Import the functions to test
let userFunctions: any;

describe('User Functions Integration Tests', () => {
  // Setup before all tests
  beforeAll(async () => {
    // Mock Firebase Auth methods
    jest.spyOn(admin.auth(), 'createUser').mockImplementation(() => {
      const uid = 'test-user-' + Date.now();
      return Promise.resolve({
        uid,
        email: 'test@example.com',
        emailVerified: false,
        displayName: 'Test User',
        photoURL: null,
        phoneNumber: '+1234567890',
        disabled: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
          toJSON: () => ({})
        },
        providerData: [],
        toJSON: () => ({}),
        customClaims: {}
      } as any);
    });

    jest.spyOn(admin.auth(), 'getUser').mockImplementation((uid) => {
      return Promise.resolve({
        uid,
        email: 'test@example.com',
        emailVerified: false,
        displayName: 'Test User',
        photoURL: null,
        phoneNumber: '+1234567890',
        disabled: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
          toJSON: () => ({})
        },
        providerData: [],
        toJSON: () => ({}),
        customClaims: { role: uid.includes('admin') ? 'admin' : 'user' }
      } as any);
    });

    jest.spyOn(admin.auth(), 'setCustomUserClaims').mockImplementation(() => {
      return Promise.resolve();
    });

    // Mock Firebase Storage methods
    jest.spyOn(admin.storage(), 'bucket').mockReturnValue({
      file: jest.fn().mockReturnValue({
        getSignedUrl: jest.fn().mockResolvedValue(['https://example.com/upload-url'])
      }),
      name: 'test-bucket'
    } as any);
    
    // Import the functions module
    userFunctions = require('../../api/userFunctions');
    
    // Wrap the functions for testing
    userFunctions.registerUser = testEnv.wrap(userFunctions.registerUser);
    userFunctions.updateMyUserProfile = testEnv.wrap(userFunctions.updateMyUserProfile);
    userFunctions.uploadVerificationDocument = testEnv.wrap(userFunctions.uploadVerificationDocument);
    userFunctions.adminVerifyDoctor = testEnv.wrap(userFunctions.adminVerifyDoctor);
    userFunctions.findDoctors = testEnv.wrap(userFunctions.findDoctors);
  });

  // Cleanup after all tests
  afterAll(async () => {
    // Clean up Firestore collections
    await cleanupFirestore(['users', 'patients', 'doctors', 'verificationDocuments']);
    
    // Clean up test environment
    testEnv.cleanup();
    
    // Restore mocks
    jest.restoreAllMocks();
  });

  // Cleanup after each test
  afterEach(async () => {
    // Clean up Firestore collections
    await cleanupFirestore(['users', 'patients', 'doctors', 'verificationDocuments']);
  });

  describe('registerUser', () => {
    it('should register a new patient user successfully', async () => {
      // Test data
      const userData = {
        email: 'patient@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        userType: UserType.PATIENT,
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        bloodType: 'A+',
        medicalHistory: ['Asthma']
      };

      // Call the function
      const result = await userFunctions.registerUser(userData, {});

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.userId).toBeDefined();
      expect(result.userType).toBe(UserType.PATIENT);

      // Verify Firestore records
      const userDoc = await admin.firestore().collection('users').doc(result.userId).get();
      expect(userDoc.exists).toBe(true);
      expect(userDoc.data()?.firstName).toBe(userData.firstName);
      expect(userDoc.data()?.lastName).toBe(userData.lastName);
      expect(userDoc.data()?.userType).toBe(UserType.PATIENT);

      const patientDoc = await admin.firestore().collection('patients').doc(result.userId).get();
      expect(patientDoc.exists).toBe(true);
      expect(patientDoc.data()?.dateOfBirth).toBe(userData.dateOfBirth);
      expect(patientDoc.data()?.gender).toBe(userData.gender);
    });

    it('should register a new doctor user successfully', async () => {
      // Test data
      const userData = {
        email: 'doctor@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Smith',
        userType: UserType.DOCTOR,
        phone: '+1234567891',
        specialty: 'Cardiology',
        licenseNumber: 'MD12345',
        yearsOfExperience: 10,
        education: [
          { institution: 'Medical School', degree: 'MD', year: 2010 }
        ],
        bio: 'Experienced cardiologist'
      };

      // Call the function
      const result = await userFunctions.registerUser(userData, {});

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.userId).toBeDefined();
      expect(result.userType).toBe(UserType.DOCTOR);

      // Verify Firestore records
      const userDoc = await admin.firestore().collection('users').doc(result.userId).get();
      expect(userDoc.exists).toBe(true);
      expect(userDoc.data()?.firstName).toBe(userData.firstName);
      expect(userDoc.data()?.lastName).toBe(userData.lastName);
      expect(userDoc.data()?.userType).toBe(UserType.DOCTOR);

      const doctorDoc = await admin.firestore().collection('doctors').doc(result.userId).get();
      expect(doctorDoc.exists).toBe(true);
      expect(doctorDoc.data()?.specialty).toBe(userData.specialty);
      expect(doctorDoc.data()?.licenseNumber).toBe(userData.licenseNumber);
      expect(doctorDoc.data()?.verificationStatus).toBe(VerificationStatus.PENDING);
    });

    it('should reject registration with invalid data', async () => {
      // Test data with missing required fields
      const userData = {
        email: 'invalid@example.com',
        // Missing password
        firstName: 'Invalid',
        lastName: 'User',
        userType: UserType.PATIENT
      };

      // Call the function and expect it to throw
      await expect(userFunctions.registerUser(userData, {}))
        .rejects.toThrow();
    });
  });

  describe('updateMyUserProfile', () => {
    // Setup: Create a test user before each test
    let userId: string;
    let userContext: any;

    beforeEach(async () => {
      // Create a test user in Firestore
      userId = 'test-user-' + Date.now();
      userContext = createAuthUser(userId, 'test@example.com');

      // Create user profile
      await admin.firestore().collection('users').doc(userId).set({
        userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        userType: UserType.PATIENT,
        createdAt: admin.firestore.Timestamp.now()
      });

      // Create patient profile
      await admin.firestore().collection('patients').doc(userId).set({
        userId,
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        bloodType: 'A+',
        medicalHistory: ['None']
      });
    });

    it('should update user profile successfully', async () => {
      // Test data
      const updateData = {
        userProfile: {
          firstName: 'Updated',
          lastName: 'Name',
          phone: '+9876543210'
        },
        patientProfile: {
          bloodType: 'B+',
          medicalHistory: ['Allergies']
        }
      };

      // Call the function
      const result = await userFunctions.updateMyUserProfile(updateData, userContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.userProfile).toBeDefined();
      expect(result.userProfile.firstName).toBe(updateData.userProfile.firstName);
      expect(result.userProfile.lastName).toBe(updateData.userProfile.lastName);
      expect(result.typeProfile).toBeDefined();
      expect(result.typeProfile.bloodType).toBe(updateData.patientProfile.bloodType);

      // Verify Firestore records
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      expect(userDoc.data()?.firstName).toBe(updateData.userProfile.firstName);
      expect(userDoc.data()?.lastName).toBe(updateData.userProfile.lastName);

      const patientDoc = await admin.firestore().collection('patients').doc(userId).get();
      expect(patientDoc.data()?.bloodType).toBe(updateData.patientProfile.bloodType);
    });

    it('should reject updates without authentication', async () => {
      // Test data
      const updateData = {
        userProfile: {
          firstName: 'Updated',
          lastName: 'Name'
        }
      };

      // Call the function without auth context and expect it to throw
      await expect(userFunctions.updateMyUserProfile(updateData, {}))
        .rejects.toThrow();
    });
  });

  describe('adminVerifyDoctor', () => {
    // Setup: Create a test doctor and admin user before each test
    let doctorId: string;
    let adminId: string;
    let adminContext: any;

    beforeEach(async () => {
      // Create a test doctor in Firestore
      doctorId = 'test-doctor-' + Date.now();
      
      // Create doctor user profile
      await admin.firestore().collection('users').doc(doctorId).set({
        userId: doctorId,
        email: 'doctor@example.com',
        firstName: 'Doctor',
        lastName: 'Test',
        userType: UserType.DOCTOR,
        createdAt: admin.firestore.Timestamp.now()
      });

      // Create doctor profile
      await admin.firestore().collection('doctors').doc(doctorId).set({
        userId: doctorId,
        specialty: 'Cardiology',
        licenseNumber: 'MD12345',
        verificationStatus: VerificationStatus.PENDING,
        yearsOfExperience: 5
      });

      // Create admin user
      adminId = 'admin-user-' + Date.now();
      adminContext = createAuthUser(adminId, 'admin@example.com', { admin: true });
    });

    it('should verify a doctor successfully', async () => {
      // Test data
      const verificationData = {
        doctorId,
        status: VerificationStatus.VERIFIED,
        notes: 'All documents verified'
      };

      // Call the function
      const result = await userFunctions.adminVerifyDoctor(verificationData, adminContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.doctor).toBeDefined();
      expect(result.doctor.verificationStatus).toBe(VerificationStatus.VERIFIED);
      expect(result.doctor.verificationNotes).toBe(verificationData.notes);

      // Verify Firestore records
      const doctorDoc = await admin.firestore().collection('doctors').doc(doctorId).get();
      expect(doctorDoc.data()?.verificationStatus).toBe(VerificationStatus.VERIFIED);
      expect(doctorDoc.data()?.verificationNotes).toBe(verificationData.notes);
    });

    it('should reject verification from non-admin users', async () => {
      // Create another user
      const otherUserId = 'regular-user';
      const otherUserContext = createAuthUser(otherUserId, 'user@example.com');
      
      // Test data
      const verificationData = {
        doctorId,
        status: VerificationStatus.VERIFIED,
        notes: 'All documents verified'
      };

      // Call the function with unauthorized user and expect it to throw
      await expect(userFunctions.adminVerifyDoctor(verificationData, otherUserContext))
        .rejects.toThrow();
    });
  });

  describe('findDoctors', () => {
    // Setup: Create test doctors before each test
    let userContext: any;

    beforeEach(async () => {
      // Create a regular user for search context
      const userId = 'test-user-' + Date.now();
      userContext = createAuthUser(userId, 'user@example.com');
      
      // Create test doctors
      const doctors = [
        {
          userId: 'doctor-1',
          firstName: 'John',
          lastName: 'Cardiologist',
          specialty: 'Cardiology',
          location: 'New York',
          verificationStatus: VerificationStatus.VERIFIED
        },
        {
          userId: 'doctor-2',
          firstName: 'Jane',
          lastName: 'Neurologist',
          specialty: 'Neurology',
          location: 'Boston',
          verificationStatus: VerificationStatus.VERIFIED
        },
        {
          userId: 'doctor-3',
          firstName: 'Bob',
          lastName: 'Pediatrician',
          specialty: 'Pediatrics',
          location: 'New York',
          verificationStatus: VerificationStatus.PENDING
        }
      ];

      // Create user profiles and doctor profiles
      for (const doctor of doctors) {
        await admin.firestore().collection('users').doc(doctor.userId).set({
          userId: doctor.userId,
          email: `${doctor.firstName.toLowerCase()}@example.com`,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          userType: UserType.DOCTOR,
          createdAt: admin.firestore.Timestamp.now()
        });

        await admin.firestore().collection('doctors').doc(doctor.userId).set({
          userId: doctor.userId,
          specialty: doctor.specialty,
          location: doctor.location,
          verificationStatus: doctor.verificationStatus,
          licenseNumber: `MD${doctor.userId}`,
          yearsOfExperience: 5
        });
      }
    });

    it('should find doctors by specialty', async () => {
      // Test data
      const searchData = {
        specialty: 'Cardiology'
      };

      // Call the function
      const result = await userFunctions.findDoctors(searchData, userContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.doctors).toBeDefined();
      expect(result.doctors.length).toBe(1);
      expect(result.doctors[0].specialty).toBe('Cardiology');
      expect(result.doctors[0].userProfile.firstName).toBe('John');
    });

    it('should find doctors by location', async () => {
      // Test data
      const searchData = {
        location: 'New York'
      };

      // Call the function
      const result = await userFunctions.findDoctors(searchData, userContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.doctors).toBeDefined();
      // Should only return verified doctors
      expect(result.doctors.length).toBe(1);
      expect(result.doctors[0].location).toBe('New York');
      expect(result.doctors[0].userProfile.firstName).toBe('John');
    });

    it('should only return verified doctors', async () => {
      // Test data - no filters, should return all verified doctors
      const searchData = {};

      // Call the function
      const result = await userFunctions.findDoctors(searchData, userContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.doctors).toBeDefined();
      expect(result.doctors.length).toBe(2); // Only the verified doctors
      
      // Check that all returned doctors are verified
      for (const doctor of result.doctors) {
        expect(doctor.verificationStatus).toBe(VerificationStatus.VERIFIED);
      }
    });
  });

  describe('uploadVerificationDocument', () => {
    // Setup: Create a test doctor user before each test
    let doctorId: string;
    let doctorContext: any;
    
    beforeEach(async () => {
      // Create a test doctor in Firestore
      doctorId = 'test-doctor-' + Date.now();
      doctorContext = createAuthUser(doctorId, 'doctor@example.com');
      
      // Create doctor user profile
      await admin.firestore().collection('users').doc(doctorId).set({
        userId: doctorId,
        email: 'doctor@example.com',
        firstName: 'Doctor',
        lastName: 'Test',
        userType: UserType.DOCTOR,
        createdAt: admin.firestore.Timestamp.now()
      });

      // Create doctor profile
      await admin.firestore().collection('doctors').doc(doctorId).set({
        userId: doctorId,
        specialty: 'Cardiology',
        licenseNumber: 'MD12345',
        verificationStatus: VerificationStatus.PENDING,
        yearsOfExperience: 5
      });
    });

    it('should generate upload URL for verification document', async () => {
      // Test data
      const documentData = {
        documentType: 'Medical License',
        fileName: 'license.pdf',
        contentType: 'application/pdf'
      };

      // Call the function
      const result = await userFunctions.uploadVerificationDocument(documentData, doctorContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.uploadUrl).toBe('https://example.com/upload-url');
      expect(result.document).toBeDefined();
      expect(result.document.doctorId).toBe(doctorId);
      expect(result.document.documentType).toBe(documentData.documentType);
      
      // Verify Firestore record was created
      const verificationDocsQuery = await admin.firestore()
        .collection('verificationDocuments')
        .where('doctorId', '==', doctorId)
        .get();
      
      expect(verificationDocsQuery.empty).toBe(false);
      const doc = verificationDocsQuery.docs[0];
      expect(doc.data().documentType).toBe(documentData.documentType);
    });

    it('should reject document upload from non-doctor users', async () => {
      // Test data
      const documentData = {
        documentType: 'Medical License',
        fileName: 'license.pdf',
        contentType: 'application/pdf'
      };

      // Create patient user context
      const patientContext = createAuthUser('patient-user', 'patient@example.com');
      
      // Create patient user in Firestore
      await admin.firestore().collection('users').doc('patient-user').set({
        userId: 'patient-user',
        email: 'patient@example.com',
        firstName: 'Patient',
        lastName: 'Test',
        userType: UserType.PATIENT,
        createdAt: admin.firestore.Timestamp.now()
      });

      // Call the function with patient context and expect it to throw
      await expect(userFunctions.uploadVerificationDocument(documentData, patientContext))
        .rejects.toThrow();
    });
  });
});
