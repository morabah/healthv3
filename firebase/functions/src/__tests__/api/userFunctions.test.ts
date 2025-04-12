/**
 * Unit tests for user API functions
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UserType } from '../../../../../src/types/enums';
import { registerUser } from '../../api/userFunctions';
import { validateUserRegistration } from '../../utils/validation';
import { createUserProfile } from '../../user/userManagement';
import { createPatientProfile } from '../../user/patientManagement';
import { createDoctorProfile } from '../../user/doctorManagement';
import { logInfo, logError } from '../../../../../src/lib/logger';
import { trackPerformance } from '../../../../../src/lib/performance';

// Mock Firebase Functions
jest.mock('firebase-functions', () => {
  return {
    https: {
      HttpsError: jest.fn().mockImplementation((code, message, details) => {
        return { code, message, details };
      }),
      onCall: jest.fn(handler => handler)
    },
    config: jest.fn(() => ({})),
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    }
  };
});

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => {
  return {
    auth: jest.fn(() => ({
      createUser: jest.fn(),
      setCustomUserClaims: jest.fn()
    })),
    firestore: jest.fn(() => ({
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      set: jest.fn(),
      update: jest.fn(),
      get: jest.fn()
    }))
  };
});

// Mock validation utilities
jest.mock('../../utils/validation', () => ({
  validateUserRegistration: jest.fn()
}));

// Mock user management functions
jest.mock('../../user/userManagement', () => ({
  createUserProfile: jest.fn()
}));

// Mock patient management functions
jest.mock('../../user/patientManagement', () => ({
  createPatientProfile: jest.fn()
}));

// Mock doctor management functions
jest.mock('../../user/doctorManagement', () => ({
  createDoctorProfile: jest.fn(),
  updateDoctorProfile: jest.fn(),
  updateDoctorVerificationStatus: jest.fn(),
  submitVerificationDocument: jest.fn()
}));

// Mock logger
jest.mock('../../../../../src/lib/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
  logWarn: jest.fn(),
  logDebug: jest.fn()
}));

// Mock performance tracker
jest.mock('../../../../../src/lib/performance', () => ({
  trackPerformance: jest.fn(() => ({
    stop: jest.fn()
  }))
}));

describe('User API Functions', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    // Mock data
    const mockPatientData = {
      email: 'patient@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
      userType: UserType.PATIENT,
      phone: '+1234567890',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      bloodType: 'O+',
      medicalHistory: []
    };

    const mockDoctorData = {
      email: 'doctor@example.com',
      password: 'Password123',
      firstName: 'Jane',
      lastName: 'Smith',
      userType: UserType.DOCTOR,
      phone: '+1987654321',
      specialty: 'Cardiology',
      licenseNumber: 'MD12345',
      yearsOfExperience: 10,
      education: [{ institution: 'Medical School', degree: 'MD', year: 2010 }],
      bio: 'Experienced cardiologist'
    };

    // Mock context
    const mockContext = {
      auth: null
    };

    it('should register a new patient successfully', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockUserRecord = { uid: mockUserId, email: mockPatientData.email };
      const mockUserProfile = { id: mockUserId, ...mockPatientData };
      const mockPatientProfile = { userId: mockUserId, ...mockPatientData };
      
      // Mock validation to return valid
      (validateUserRegistration as jest.Mock).mockReturnValue({ isValid: true, errors: {} });
      
      // Mock Firebase Auth createUser
      admin.auth().createUser.mockResolvedValue(mockUserRecord);
      
      // Mock createUserProfile
      (createUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
      
      // Mock createPatientProfile
      (createPatientProfile as jest.Mock).mockResolvedValue(mockPatientProfile);
      
      // Act
      const result = await registerUser(mockPatientData, mockContext);
      
      // Assert
      expect(validateUserRegistration).toHaveBeenCalledWith(mockPatientData);
      
      expect(admin.auth().createUser).toHaveBeenCalledWith({
        email: mockPatientData.email,
        password: mockPatientData.password,
        displayName: `${mockPatientData.firstName} ${mockPatientData.lastName}`,
        phoneNumber: mockPatientData.phone,
        disabled: false
      });
      
      expect(createUserProfile).toHaveBeenCalledWith(
        mockUserId,
        mockPatientData.email,
        mockPatientData.phone,
        mockPatientData.firstName,
        mockPatientData.lastName,
        UserType.PATIENT
      );
      
      expect(createPatientProfile).toHaveBeenCalled();
      expect(createDoctorProfile).not.toHaveBeenCalled();
      
      expect(admin.auth().setCustomUserClaims).toHaveBeenCalledWith(
        mockUserId,
        { role: UserType.PATIENT }
      );
      
      // Verify result
      expect(result).toEqual({
        userId: mockUserId,
        userType: UserType.PATIENT
      });
      
      // Verify logging
      expect(logInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User registration function called'
        })
      );
      
      expect(logInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Firebase Auth user created'
        })
      );
      
      expect(logInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User registered successfully'
        })
      );
      
      // Verify performance tracking
      expect(trackPerformance).toHaveBeenCalledWith('registerUser', 'functions');
    });

    it('should register a new doctor successfully', async () => {
      // Arrange
      const mockUserId = 'user-456';
      const mockUserRecord = { uid: mockUserId, email: mockDoctorData.email };
      const mockUserProfile = { id: mockUserId, ...mockDoctorData };
      const mockDoctorProfile = { userId: mockUserId, ...mockDoctorData };
      
      // Mock validation to return valid
      (validateUserRegistration as jest.Mock).mockReturnValue({ isValid: true, errors: {} });
      
      // Mock Firebase Auth createUser
      admin.auth().createUser.mockResolvedValue(mockUserRecord);
      
      // Mock createUserProfile
      (createUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
      
      // Mock createDoctorProfile
      (createDoctorProfile as jest.Mock).mockResolvedValue(mockDoctorProfile);
      
      // Act
      const result = await registerUser(mockDoctorData, mockContext);
      
      // Assert
      expect(validateUserRegistration).toHaveBeenCalledWith(mockDoctorData);
      
      expect(admin.auth().createUser).toHaveBeenCalledWith({
        email: mockDoctorData.email,
        password: mockDoctorData.password,
        displayName: `${mockDoctorData.firstName} ${mockDoctorData.lastName}`,
        phoneNumber: mockDoctorData.phone,
        disabled: false
      });
      
      expect(createUserProfile).toHaveBeenCalledWith(
        mockUserId,
        mockDoctorData.email,
        mockDoctorData.phone,
        mockDoctorData.firstName,
        mockDoctorData.lastName,
        UserType.DOCTOR
      );
      
      expect(createDoctorProfile).toHaveBeenCalled();
      expect(createPatientProfile).not.toHaveBeenCalled();
      
      expect(admin.auth().setCustomUserClaims).toHaveBeenCalledWith(
        mockUserId,
        { role: UserType.DOCTOR }
      );
      
      // Verify result
      expect(result).toEqual({
        userId: mockUserId,
        userType: UserType.DOCTOR
      });
    });

    it('should throw an error when validation fails', async () => {
      // Arrange
      const validationErrors = {
        email: 'Invalid email format',
        password: 'Password too weak'
      };
      
      // Mock validation to return invalid
      (validateUserRegistration as jest.Mock).mockReturnValue({ 
        isValid: false, 
        errors: validationErrors 
      });
      
      // Act & Assert
      await expect(registerUser(mockPatientData, mockContext))
        .rejects.toEqual(
          expect.objectContaining({
            code: 'invalid-argument',
            message: 'Invalid registration data',
            details: validationErrors
          })
        );
      
      // Verify error logging
      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User registration validation failed',
          data: { errors: validationErrors }
        })
      );
      
      // Verify that no user was created
      expect(admin.auth().createUser).not.toHaveBeenCalled();
      expect(createUserProfile).not.toHaveBeenCalled();
      expect(createPatientProfile).not.toHaveBeenCalled();
      expect(createDoctorProfile).not.toHaveBeenCalled();
    });

    it('should handle errors from Firebase Auth', async () => {
      // Arrange
      const mockError = new Error('Email already in use');
      
      // Mock validation to return valid
      (validateUserRegistration as jest.Mock).mockReturnValue({ isValid: true, errors: {} });
      
      // Mock Firebase Auth createUser to throw an error
      admin.auth().createUser.mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(registerUser(mockPatientData, mockContext))
        .rejects.toEqual(
          expect.objectContaining({
            code: 'internal',
            message: 'Error creating user'
          })
        );
      
      // Verify error logging
      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error creating Firebase Auth user',
          data: expect.objectContaining({
            error: mockError
          })
        })
      );
      
      // Verify that no profiles were created
      expect(createUserProfile).not.toHaveBeenCalled();
      expect(createPatientProfile).not.toHaveBeenCalled();
      expect(createDoctorProfile).not.toHaveBeenCalled();
    });

    it('should handle errors from profile creation', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockUserRecord = { uid: mockUserId, email: mockPatientData.email };
      const mockError = new Error('Firestore error');
      
      // Mock validation to return valid
      (validateUserRegistration as jest.Mock).mockReturnValue({ isValid: true, errors: {} });
      
      // Mock Firebase Auth createUser
      admin.auth().createUser.mockResolvedValue(mockUserRecord);
      
      // Mock createUserProfile to throw an error
      (createUserProfile as jest.Mock).mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(registerUser(mockPatientData, mockContext))
        .rejects.toEqual(
          expect.objectContaining({
            code: 'internal',
            message: 'Error creating user profile'
          })
        );
      
      // Verify error logging
      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error creating user profile',
          data: expect.objectContaining({
            error: mockError
          })
        })
      );
      
      // Verify that no patient/doctor profile was created
      expect(createPatientProfile).not.toHaveBeenCalled();
      expect(createDoctorProfile).not.toHaveBeenCalled();
    });

    it('should capture console logs during execution', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockUserRecord = { uid: mockUserId, email: mockPatientData.email };
      
      // Mock validation to return valid
      (validateUserRegistration as jest.Mock).mockReturnValue({ isValid: true, errors: {} });
      
      // Mock Firebase Auth createUser
      admin.auth().createUser.mockResolvedValue(mockUserRecord);
      
      // Mock console.log to verify it's captured
      const originalConsoleLog = console.log;
      console.log = jest.fn();
      
      // Add a console.log in one of our mocked functions
      (createUserProfile as jest.Mock).mockImplementation(() => {
        console.log('Creating user profile in Firestore');
        return Promise.resolve({ id: mockUserId });
      });
      
      // Act
      await registerUser(mockPatientData, mockContext);
      
      // Assert
      expect(console.log).toHaveBeenCalledWith('Creating user profile in Firestore');
      
      // Restore console.log
      console.log = originalConsoleLog;
    });
  });
});
