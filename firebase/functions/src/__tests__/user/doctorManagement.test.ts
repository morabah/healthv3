/**
 * Unit tests for doctor management functions
 */
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { 
  createDoctorProfile, 
  updateDoctorProfile, 
  updateDoctorVerificationStatus,
  submitVerificationDocument
} from '../../user/doctorManagement';
import { DoctorProfile, VerificationDocument } from '../../../../../src/types/doctor';
import { VerificationStatus } from '../../../../../src/types/enums';
import { logInfo, logError } from '../../../../../src/lib/logger';
import { trackPerformance } from '../../../../../src/lib/performance';

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => {
  const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    set: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        userId: 'doctor-123',
        firstName: 'Dr. John',
        lastName: 'Smith',
        specialty: 'Cardiology',
        licenseNumber: 'MD12345',
        isVerified: false,
        verificationStatus: VerificationStatus.PENDING,
        verificationDocuments: []
      })
    })
  };

  return {
    firestore: jest.fn(() => firestoreMock)
  };
});

// Mock Timestamp
jest.mock('firebase-admin/firestore', () => {
  return {
    Timestamp: {
      now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 123456789 })),
      fromDate: jest.fn((date) => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 }))
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

describe('Doctor Management Functions', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDoctorProfile', () => {
    const mockTimestamp = {
      toDate: () => new Date(),
      seconds: 1234567890,
      nanoseconds: 123456789
    };

    const mockDoctorProfile: DoctorProfile = {
      userId: 'doctor-123',
      specialty: 'Cardiology',
      licenseNumber: 'MD12345',
      yearsOfExperience: 10,
      education: [
        {
          institution: 'Medical University',
          degree: 'MD',
          year: 2010
        }
      ],
      bio: 'Experienced cardiologist with 10 years of practice',
      isVerified: false,
      verificationStatus: VerificationStatus.PENDING,
      verificationDocuments: [],
      availabilitySlots: [],
      ratings: {
        average: 0,
        count: 0
      }
    };

    it('should create a doctor profile successfully', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      
      // Act
      const result = await createDoctorProfile(mockDoctorProfile);

      // Assert
      expect(firestoreMock.collection).toHaveBeenCalledWith('doctors');
      expect(firestoreMock.doc).toHaveBeenCalledWith(mockDoctorProfile.userId);
      expect(firestoreMock.set).toHaveBeenCalledWith(expect.objectContaining({
        userId: mockDoctorProfile.userId,
        specialty: mockDoctorProfile.specialty,
        licenseNumber: mockDoctorProfile.licenseNumber,
        yearsOfExperience: mockDoctorProfile.yearsOfExperience,
        isVerified: false,
        verificationStatus: VerificationStatus.PENDING
      }));

      // Verify the returned doctor profile
      expect(result).toEqual(mockDoctorProfile);

      // Verify logging
      expect(logInfo).toHaveBeenCalledTimes(2);
      expect(logInfo).toHaveBeenNthCalledWith(1, {
        message: 'Creating doctor profile',
        context: 'doctorManagement',
        data: { userId: mockDoctorProfile.userId }
      });
      expect(logInfo).toHaveBeenNthCalledWith(2, {
        message: 'Doctor profile created successfully',
        context: 'doctorManagement',
        data: { userId: mockDoctorProfile.userId }
      });

      // Verify performance tracking
      expect(trackPerformance).toHaveBeenCalledWith('createDoctorProfile', 'doctorManagement');
      const mockPerfTracker = trackPerformance('createDoctorProfile', 'doctorManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalled();
    });

    it('should throw an error if userId is missing', async () => {
      // Arrange
      const invalidProfile = { ...mockDoctorProfile, userId: '' };
      
      // Act & Assert
      await expect(createDoctorProfile(invalidProfile as DoctorProfile))
        .rejects.toThrow('userId is required for doctor profile');

      // Verify error logging
      expect(logError).toHaveBeenCalledWith({
        message: 'Error creating doctor profile',
        context: 'doctorManagement',
        data: { userId: '', error: expect.any(Error) }
      });

      // Verify performance tracking with error
      const mockPerfTracker = trackPerformance('createDoctorProfile', 'doctorManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalledWith({ userId: '', error: true });
    });
  });

  describe('updateDoctorProfile', () => {
    const mockDoctorId = 'doctor-123';
    const mockUpdates = {
      specialty: 'Neurology',
      bio: 'Updated bio information',
      yearsOfExperience: 12
    };

    it('should update a doctor profile successfully', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      
      // Act
      const result = await updateDoctorProfile(mockDoctorId, mockUpdates);

      // Assert
      expect(firestoreMock.collection).toHaveBeenCalledWith('doctors');
      expect(firestoreMock.doc).toHaveBeenCalledWith(mockDoctorId);
      expect(firestoreMock.get).toHaveBeenCalled();
      expect(firestoreMock.update).toHaveBeenCalledWith(mockUpdates);

      // Verify logging
      expect(logInfo).toHaveBeenCalledWith({
        message: 'Updating doctor profile',
        context: 'doctorManagement',
        data: { doctorId: mockDoctorId, updates: mockUpdates }
      });

      // Verify performance tracking
      expect(trackPerformance).toHaveBeenCalledWith('updateDoctorProfile', 'doctorManagement');
    });

    it('should throw an error if doctor profile not found', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      firestoreMock.get.mockResolvedValueOnce({ exists: false });
      
      // Act & Assert
      await expect(updateDoctorProfile(mockDoctorId, mockUpdates))
        .rejects.toThrow(`Doctor profile with ID ${mockDoctorId} not found`);

      // Verify error logging
      expect(logError).toHaveBeenCalled();
    });

    it('should remove userId from updates if present', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const updatesWithUserId = {
        ...mockUpdates,
        userId: 'different-id' // This should be ignored
      };
      
      // Act
      await updateDoctorProfile(mockDoctorId, updatesWithUserId);

      // Assert - userId should be removed from the updates
      expect(firestoreMock.update).toHaveBeenCalledWith(mockUpdates);
      expect(firestoreMock.update).not.toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'different-id' })
      );
    });
  });

  describe('updateDoctorVerificationStatus', () => {
    const mockDoctorId = 'doctor-123';
    const mockStatus = VerificationStatus.VERIFIED;
    const mockNotes = 'All documents verified and approved';

    it('should update verification status successfully', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const mockUpdate = jest.fn();
      firestoreMock.update.mockImplementation(mockUpdate);
      firestoreMock.update.mockReturnValue(Promise.resolve());
      const mockVerificationDate = { seconds: 1234567890, nanoseconds: 123456789 };
      
      // Act
      await updateDoctorVerificationStatus(mockDoctorId, mockStatus, mockNotes);

      // Assert
      expect(firestoreMock.collection).toHaveBeenCalledWith('doctors');
      expect(firestoreMock.doc).toHaveBeenCalledWith(mockDoctorId);
      expect(firestoreMock.get).toHaveBeenCalled();
      expect(firestoreMock.update).toHaveBeenCalledWith({
        verificationStatus: mockStatus,
        verificationNotes: mockNotes
      });

      // Verify logging
      expect(logInfo).toHaveBeenCalledWith({
        message: 'Updating doctor verification status',
        context: 'doctorManagement',
        data: { 
          doctorId: mockDoctorId, 
          status: mockStatus,
          notes: mockNotes
        }
      });

      // Verify performance tracking
      expect(trackPerformance).toHaveBeenCalledWith('updateDoctorVerificationStatus', 'doctorManagement');
    });

    it('should throw an error if doctor profile not found', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      firestoreMock.get.mockResolvedValueOnce({ exists: false });
      
      // Act & Assert
      await expect(updateDoctorVerificationStatus(mockDoctorId, mockStatus))
        .rejects.toThrow(`Doctor profile with ID ${mockDoctorId} not found`);

      // Verify error logging
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('submitVerificationDocument', () => {
    const mockTimestamp = {
      toDate: () => new Date(),
      seconds: 1234567890,
      nanoseconds: 123456789
    };

    const mockVerificationDoc: VerificationDocument = {
      doctorId: 'doctor-123',
      documentType: 'Medical License',
      fileName: 'license.pdf',
      fileUrl: 'https://storage.example.com/license.pdf',
      mimeType: 'application/pdf',
      uploadDate: mockTimestamp as any,
      status: VerificationStatus.PENDING,
      notes: ''
    };

    it('should submit verification document successfully', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      
      // Mock document reference
      const mockDocRef = {
        id: 'generated-doc-id',
        set: jest.fn().mockResolvedValue(undefined)
      };
      
      // Mock collection and doc methods
      firestoreMock.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });
      
      // Act
      const result = await submitVerificationDocument(mockVerificationDoc);

      // Assert
      expect(firestoreMock.collection).toHaveBeenCalledWith('verificationDocuments');
      expect(mockDocRef.set).toHaveBeenCalled();

      // Verify logging
      expect(logInfo).toHaveBeenCalledWith({
        message: 'Submitting verification document',
        context: 'doctorManagement',
        data: { 
          doctorId: mockVerificationDoc.doctorId, 
          documentType: mockVerificationDoc.documentType
        }
      });
      
      expect(logInfo).toHaveBeenCalledWith({
        message: 'Verification document submitted successfully',
        context: 'doctorManagement',
        data: { 
          doctorId: mockVerificationDoc.doctorId, 
          documentId: mockDocRef.id
        }
      });

      // Verify performance tracking
      expect(trackPerformance).toHaveBeenCalledWith('submitVerificationDocument', 'doctorManagement');
      const mockPerfTracker = trackPerformance('submitVerificationDocument', 'doctorManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalled();
    });

    it('should throw an error if doctorId is missing', async () => {
      // Arrange
      const invalidDoc = { ...mockVerificationDoc, doctorId: '' };
      
      // Act & Assert
      await expect(submitVerificationDocument(invalidDoc as VerificationDocument))
        .rejects.toThrow('doctorId, documentType, and fileUrl are required for verification document');

      // Verify error logging
      expect(logError).toHaveBeenCalled();
    });
  });
});
