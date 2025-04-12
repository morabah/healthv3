import * as admin from 'firebase-admin';
import { createPatientProfile, getPatientProfile } from '../../user/patientManagement';
import { PatientProfile } from '../../../../../src/types/patient';
import { UserType } from '../../../../../src/types/enums';
import { logInfo, logError } from '../../../../../src/lib/logger';
import { trackPerformance } from '../../../../../src/lib/performance';

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => {
  const mockTimestamp = {
    toDate: () => new Date(),
    seconds: 1234567890,
    nanoseconds: 123456789
  };

  const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        userId: 'patient-123',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        bloodType: 'O+',
        medicalHistory: [],
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp
      })
    })
  };

  return {
    firestore: jest.fn(() => firestoreMock)
  };
});

// Mock logger
jest.mock('../../../../../src/lib/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
  logWarn: jest.fn(),
  logDebug: jest.fn()
}));

// Mock performance tracker
jest.mock('../../../../../src/lib/performance', () => {
  const mockStop = jest.fn();
  return {
    trackPerformance: jest.fn(() => ({
      stop: mockStop
    }))
  };
});

describe('Patient Management Functions', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPatientProfile', () => {
    const mockPatientProfile: PatientProfile = {
      userId: 'patient-123',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      bloodType: 'O+',
      medicalHistory: [],
      createdAt: null,
      updatedAt: null
    };

    it('should create a patient profile successfully', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const docRef = {
        set: jest.fn().mockResolvedValue({})
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      // Act
      const result = await createPatientProfile(mockPatientProfile);

      // Assert
      expect(firestoreMock.collection).toHaveBeenCalledWith('patients');
      expect(firestoreMock.doc).toHaveBeenCalledWith(mockPatientProfile.userId);
      expect(docRef.set).toHaveBeenCalledWith(expect.objectContaining({
        userId: mockPatientProfile.userId,
        firstName: mockPatientProfile.firstName,
        lastName: mockPatientProfile.lastName,
        dateOfBirth: mockPatientProfile.dateOfBirth,
        gender: mockPatientProfile.gender,
        bloodType: mockPatientProfile.bloodType,
        medicalHistory: mockPatientProfile.medicalHistory
      }));

      // Verify the returned patient profile
      expect(result).toEqual(expect.objectContaining({
        userId: mockPatientProfile.userId,
        firstName: mockPatientProfile.firstName,
        lastName: mockPatientProfile.lastName
      }));

      // Verify logging
      expect(logInfo).toHaveBeenCalledTimes(2);
      expect(logInfo).toHaveBeenNthCalledWith(1, {
        message: 'Creating patient profile',
        context: 'patientManagement',
        data: { userId: mockPatientProfile.userId }
      });
      expect(logInfo).toHaveBeenNthCalledWith(2, {
        message: 'Patient profile created successfully',
        context: 'patientManagement',
        data: { userId: mockPatientProfile.userId }
      });

      // Verify performance tracking
      expect(trackPerformance).toHaveBeenCalledWith('createPatientProfile', 'patientManagement');
      const mockPerfTracker = trackPerformance('createPatientProfile', 'patientManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalled();
    });

    it('should throw an error if userId is missing', async () => {
      // Arrange
      const invalidProfile = { ...mockPatientProfile, userId: '' };
      
      // Act & Assert
      await expect(createPatientProfile(invalidProfile as PatientProfile))
        .rejects.toThrow('userId is required for patient profile');

      // Verify error logging
      expect(logError).toHaveBeenCalledWith({
        message: 'Error creating patient profile',
        context: 'patientManagement',
        data: { userId: '', error: expect.any(Error) }
      });

      // Verify performance tracking with error
      const mockPerfTracker = trackPerformance('createPatientProfile', 'patientManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalled();
    });
  });

  describe('getPatientProfile', () => {
    const mockUserId = 'patient-123';

    it('should get a patient profile successfully', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const docRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            userId: mockUserId,
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
            gender: 'male',
            bloodType: 'O+'
          })
        })
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      // Act
      const result = await getPatientProfile(mockUserId);

      // Assert
      expect(firestoreMock.collection).toHaveBeenCalledWith('patients');
      expect(firestoreMock.doc).toHaveBeenCalledWith(mockUserId);
      expect(docRef.get).toHaveBeenCalled();

      // Verify the returned patient profile
      expect(result).toEqual({
        userId: mockUserId,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        bloodType: 'O+'
      });

      // Verify logging
      expect(logInfo).toHaveBeenCalledWith({
        message: 'Getting patient profile',
        context: 'patientManagement',
        data: { userId: mockUserId }
      });

      // Verify performance tracking
      expect(trackPerformance).toHaveBeenCalledWith('getPatientProfile', 'patientManagement');
      const mockPerfTracker = trackPerformance('getPatientProfile', 'patientManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalled();
    });

    it('should return null if patient profile not found', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const docRef = {
        get: jest.fn().mockResolvedValue({
          exists: false
        })
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      // Act
      const result = await getPatientProfile(mockUserId);

      // Assert
      expect(result).toBeNull();

      // Verify logging
      expect(logInfo).toHaveBeenCalledWith({
        message: 'Patient profile not found',
        context: 'patientManagement',
        data: { userId: mockUserId }
      });
    });

    it('should handle errors when getting a patient profile', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const mockError = new Error('Firestore error');
      const docRef = {
        get: jest.fn().mockRejectedValue(mockError)
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      // Act & Assert
      await expect(getPatientProfile(mockUserId)).rejects.toThrow('Firestore error');

      // Verify error logging
      expect(logError).toHaveBeenCalledWith({
        message: 'Error getting patient profile',
        context: 'patientManagement',
        data: { userId: mockUserId, error: mockError }
      });

      // Verify performance tracking with error
      const mockPerfTracker = trackPerformance('getPatientProfile', 'patientManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalled();
    });
  });
});
