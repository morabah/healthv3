/**
 * Unit tests for appointment management functions
 */
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { 
  createAppointment, 
  updateAppointmentStatus 
} from '../../appointment/appointmentManagement';
import { Appointment } from '../../../../../src/types/appointment';
import { AppointmentStatus } from '../../../../../src/types/enums';
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
    set: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        id: 'appointment-123',
        patientId: 'patient-123',
        doctorId: 'doctor-123',
        appointmentDate: mockTimestamp,
        startTime: '10:00',
        endTime: '11:00',
        status: AppointmentStatus.PENDING,
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
jest.mock('../../../../../src/lib/performance', () => ({
  trackPerformance: jest.fn(() => ({
    stop: jest.fn()
  }))
}));

describe('Appointment Management Functions', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    const mockTimestamp = Timestamp.now();
    
    const mockAppointment: Appointment = {
      id: '',
      patientId: 'patient-123',
      doctorId: 'doctor-123',
      appointmentDate: mockTimestamp as any,
      startTime: '10:00',
      endTime: '11:00',
      status: AppointmentStatus.PENDING,
      reason: 'Annual checkup',
      notes: '',
      createdAt: mockTimestamp as any,
      updatedAt: mockTimestamp as any
    };

    it('should create an appointment successfully', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const docRef = {
        id: 'appointment-123',
        set: jest.fn().mockResolvedValue({})
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      // Act
      const result = await createAppointment(mockAppointment);

      // Assert
      expect(firestoreMock.collection).toHaveBeenCalledWith('appointments');
      expect(firestoreMock.doc).toHaveBeenCalled();
      expect(docRef.set).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'appointment-123',
          patientId: mockAppointment.patientId,
          doctorId: mockAppointment.doctorId,
          status: AppointmentStatus.PENDING,
          createdAt: expect.anything(),
          updatedAt: expect.anything()
        })
      );

      // Verify the returned appointment
      expect(result).toEqual(
        expect.objectContaining({
          id: 'appointment-123',
          patientId: mockAppointment.patientId,
          doctorId: mockAppointment.doctorId
        })
      );

      // Verify logging
      expect(logInfo).toHaveBeenCalledTimes(2);
      expect(logInfo).toHaveBeenNthCalledWith(1, {
        message: 'Creating appointment',
        context: 'appointmentManagement',
        data: { 
          patientId: mockAppointment.patientId, 
          doctorId: mockAppointment.doctorId, 
          appointmentDate: mockAppointment.appointmentDate 
        }
      });
      expect(logInfo).toHaveBeenNthCalledWith(2, {
        message: 'Appointment created successfully',
        context: 'appointmentManagement',
        data: { appointmentId: 'appointment-123' }
      });

      // Verify performance tracking
      expect(trackPerformance).toHaveBeenCalledWith('createAppointment', 'appointmentManagement');
      const mockPerfTracker = trackPerformance('createAppointment', 'appointmentManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalled();
    });

    it('should throw an error if required fields are missing', async () => {
      // Arrange
      const invalidAppointment = { ...mockAppointment, patientId: '' };
      
      // Act & Assert
      await expect(createAppointment(invalidAppointment as Appointment))
        .rejects.toThrow('patientId, doctorId, appointmentDate, startTime, and endTime are required for appointment');

      // Verify error logging
      expect(logError).toHaveBeenCalledWith({
        message: 'Error creating appointment',
        context: 'appointmentManagement',
        data: { 
          patientId: '', 
          doctorId: mockAppointment.doctorId, 
          error: expect.any(Error) 
        }
      });

      // Verify performance tracking with error
      const mockPerfTracker = trackPerformance('createAppointment', 'appointmentManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalled();
    });

    it('should set default values for missing fields', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const docRef = {
        id: 'appointment-123',
        set: jest.fn().mockResolvedValue({})
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      const appointmentWithoutDefaults = {
        patientId: 'patient-123',
        doctorId: 'doctor-123',
        appointmentDate: mockTimestamp as any,
        startTime: '10:00',
        endTime: '11:00'
      };
      
      // Act
      await createAppointment(appointmentWithoutDefaults as Appointment);

      // Assert
      expect(docRef.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AppointmentStatus.PENDING,
          createdAt: expect.anything(),
          updatedAt: expect.anything()
        })
      );
    });
  });

  describe('updateAppointmentStatus', () => {
    const mockAppointmentId = 'appointment-123';
    const mockStatus = AppointmentStatus.CONFIRMED;
    const mockNotes = 'Appointment confirmed by doctor';

    it('should update appointment status successfully', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const docRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            id: mockAppointmentId,
            status: AppointmentStatus.PENDING
          })
        }),
        update: jest.fn().mockResolvedValue({})
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      // Act
      const result = await updateAppointmentStatus(mockAppointmentId, mockStatus, mockNotes);

      // Assert
      expect(firestoreMock.collection).toHaveBeenCalledWith('appointments');
      expect(firestoreMock.doc).toHaveBeenCalledWith(mockAppointmentId);
      expect(docRef.get).toHaveBeenCalled();
      expect(docRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: mockStatus,
          notes: mockNotes,
          updatedAt: expect.anything()
        })
      );

      // Verify logging
      expect(logInfo).toHaveBeenCalledWith({
        message: 'Updating appointment status',
        context: 'appointmentManagement',
        data: { 
          appointmentId: mockAppointmentId, 
          status: mockStatus, 
          notes: mockNotes 
        }
      });

      // Verify performance tracking
      expect(trackPerformance).toHaveBeenCalledWith('updateAppointmentStatus', 'appointmentManagement');
      const mockPerfTracker = trackPerformance('updateAppointmentStatus', 'appointmentManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalled();
    });

    it('should update without notes if not provided', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const docRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            id: mockAppointmentId,
            status: AppointmentStatus.PENDING
          })
        }),
        update: jest.fn().mockResolvedValue({})
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      // Act
      await updateAppointmentStatus(mockAppointmentId, mockStatus);

      // Assert
      expect(docRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: mockStatus,
          updatedAt: expect.anything()
        })
      );
      
      // Verify notes field is not included
      expect(docRef.update).not.toHaveBeenCalledWith(
        expect.objectContaining({ notes: expect.anything() })
      );
    });

    it('should throw an error if appointment not found', async () => {
      // Arrange
      const firestoreMock = admin.firestore();
      const docRef = {
        get: jest.fn().mockResolvedValue({ exists: false }),
        update: jest.fn()
      };
      firestoreMock.doc.mockReturnValue(docRef);
      
      // Act & Assert
      await expect(updateAppointmentStatus(mockAppointmentId, mockStatus))
        .rejects.toThrow(`Appointment with ID ${mockAppointmentId} not found`);

      // Verify error logging
      expect(logError).toHaveBeenCalledWith({
        message: 'Error updating appointment status',
        context: 'appointmentManagement',
        data: { 
          appointmentId: mockAppointmentId, 
          status: mockStatus, 
          error: expect.any(Error) 
        }
      });

      // Verify performance tracking with error
      const mockPerfTracker = trackPerformance('updateAppointmentStatus', 'appointmentManagement');
      expect(mockPerfTracker.stop).toHaveBeenCalled();
    });
  });
});
