import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { createUserProfile, getUserProfile } from '../../user/userManagement';
import { UserProfile } from '../../../../../src/types/user';
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
        id: 'test-user-123',
        email: 'test@example.com',
        phone: '+1234567890',
        firstName: 'John',
        lastName: 'Doe',
        userType: UserType.PATIENT,
        isActive: false,
        emailVerified: false,
        phoneVerified: false,
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp
      })
    })
  };

  return {
    firestore: jest.fn(() => firestoreMock)
  };
});

// Mock Timestamp
jest.mock('firebase-admin/firestore', () => {
  const mockTimestamp = {
    toDate: () => new Date(),
    seconds: 1234567890,
    nanoseconds: 123456789
  };

  return {
    Timestamp: {
      now: jest.fn(() => mockTimestamp)
    }
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

describe('User Management Functions', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserProfile', () => {
    const mockUserId = 'test-user-123';
    const mockEmail = 'test@example.com';
    const mockPhone = '+1234567890';
    const mockFirstName = 'John';
    const mockLastName = 'Doe';
    const mockUserType = UserType.PATIENT;

    it('should create a user profile successfully', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const docRef = {
        set: jest.fn().mockResolvedValue({})
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      // Act
      const result = await createUserProfile(
        mockUserId,
        mockEmail,
        mockPhone,
        mockFirstName,
        mockLastName,
        mockUserType
      );

      // Assert
      expect(firestoreMock.collection).toHaveBeenCalledWith('users');
      expect(firestoreMock.doc).toHaveBeenCalledWith(mockUserId);
      expect(docRef.set).toHaveBeenCalledWith(expect.objectContaining({
        id: mockUserId,
        email: mockEmail,
        phone: mockPhone,
        firstName: mockFirstName,
        lastName: mockLastName,
        userType: mockUserType,
        createdAt: expect.anything(),
        updatedAt: expect.anything()
      }));

      // Verify the returned user profile
      expect(result).toEqual({
        id: mockUserId,
        email: mockEmail,
        phone: mockPhone,
        firstName: mockFirstName,
        lastName: mockLastName,
        userType: mockUserType,
        isActive: false,
        emailVerified: false,
        phoneVerified: false,
        createdAt: expect.anything(),
        updatedAt: expect.anything()
      });

      // Verify logging
      expect(logInfo).toHaveBeenCalledTimes(2);
      expect(logInfo).toHaveBeenNthCalledWith(1, {
        message: 'Creating user profile',
        context: 'userManagement',
        data: { userId: mockUserId, email: mockEmail, phone: mockPhone, firstName: mockFirstName, lastName: mockLastName, userType: mockUserType }
      });
      expect(logInfo).toHaveBeenNthCalledWith(2, {
        message: 'User profile created successfully',
        context: 'userManagement',
        data: { userId: mockUserId }
      });

      // Verify performance tracking
      expect(trackPerformance).toHaveBeenCalledWith('createUserProfile', 'userManagement');
      const mockPerfTracker = trackPerformance('createUserProfile', 'userManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalled();
    });

    it('should handle errors when creating a user profile', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const mockError = new Error('Firestore error');
      const docRef = {
        set: jest.fn().mockRejectedValue(mockError)
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      // Act & Assert
      await expect(createUserProfile(
        mockUserId,
        mockEmail,
        mockPhone,
        mockFirstName,
        mockLastName,
        mockUserType
      )).rejects.toThrow('Firestore error');

      // Verify error logging
      expect(logError).toHaveBeenCalledWith({
        message: 'Error creating user profile',
        context: 'userManagement',
        data: { userId: mockUserId, error: mockError }
      });

      // Verify performance tracking with error
      const mockPerfTracker = trackPerformance('createUserProfile', 'userManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalled();
    });

    it('should handle null phone number', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const docRef = {
        set: jest.fn().mockResolvedValue({})
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      // Act
      const result = await createUserProfile(
        mockUserId,
        mockEmail,
        null,
        mockFirstName,
        mockLastName,
        mockUserType
      );

      // Assert
      expect(docRef.set).toHaveBeenCalledWith(expect.objectContaining({
        id: mockUserId,
        email: mockEmail,
        phone: null,
        firstName: mockFirstName,
        lastName: mockLastName,
        userType: mockUserType
      }));
    });
  });

  describe('getUserProfile', () => {
    const mockUserId = 'test-user-123';

    it('should get a user profile successfully', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const docRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            id: mockUserId,
            email: 'test@example.com',
            phone: '+1234567890',
            firstName: 'John',
            lastName: 'Doe',
            userType: UserType.PATIENT
          })
        })
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      // Act
      const result = await getUserProfile(mockUserId);

      // Assert
      expect(firestoreMock.collection).toHaveBeenCalledWith('users');
      expect(firestoreMock.doc).toHaveBeenCalledWith(mockUserId);
      expect(docRef.get).toHaveBeenCalled();

      // Verify the returned user profile
      expect(result).toEqual({
        id: mockUserId,
        email: 'test@example.com',
        phone: '+1234567890',
        firstName: 'John',
        lastName: 'Doe',
        userType: UserType.PATIENT
      });

      // Verify logging
      expect(logInfo).toHaveBeenCalledWith({
        message: 'Getting user profile',
        context: 'userManagement',
        data: { userId: mockUserId }
      });

      // Verify performance tracking
      expect(trackPerformance).toHaveBeenCalledWith('getUserProfile', 'userManagement');
      const mockPerfTracker = trackPerformance('getUserProfile', 'userManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalled();
    });

    it('should return null if user profile not found', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const docRef = {
        get: jest.fn().mockResolvedValue({
          exists: false
        })
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      // Act
      const result = await getUserProfile(mockUserId);

      // Assert
      expect(result).toBeNull();

      // Verify logging
      expect(logInfo).toHaveBeenCalledWith({
        message: 'User profile not found',
        context: 'userManagement',
        data: { userId: mockUserId }
      });
    });

    it('should handle errors when getting a user profile', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const mockError = new Error('Firestore error');
      const docRef = {
        get: jest.fn().mockRejectedValue(mockError)
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      // Act & Assert
      await expect(getUserProfile(mockUserId)).rejects.toThrow('Firestore error');

      // Verify error logging
      expect(logError).toHaveBeenCalledWith({
        message: 'Error getting user profile',
        context: 'userManagement',
        data: { userId: mockUserId, error: mockError }
      });

      // Verify performance tracking with error
      const mockPerfTracker = trackPerformance('getUserProfile', 'userManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalled();
    });
  });
});
