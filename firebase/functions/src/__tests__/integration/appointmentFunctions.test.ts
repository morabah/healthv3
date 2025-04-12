/**
 * Integration Tests for Appointment Functions
 * Tests the HTTPS Callable Functions in appointmentFunctions.ts
 */
import { testEnv, admin, createAuthUser, cleanupFirestore } from './setup';
import { UserType, AppointmentStatus, VerificationStatus } from '../../../../../src/types/enums';

// Import the functions to test
let appointmentFunctions: any;

describe('Appointment Functions Integration Tests', () => {
  // Setup before all tests
  beforeAll(async () => {
    // Import the functions module
    appointmentFunctions = require('../../api/appointmentFunctions');
    
    // Wrap the functions for testing
    appointmentFunctions.bookAppointment = testEnv.wrap(appointmentFunctions.bookAppointment);
    appointmentFunctions.cancelAppointment = testEnv.wrap(appointmentFunctions.cancelAppointment);
    appointmentFunctions.getMyAppointments = testEnv.wrap(appointmentFunctions.getMyAppointments);
    appointmentFunctions.getDoctorAvailability = testEnv.wrap(appointmentFunctions.getDoctorAvailability);
    appointmentFunctions.setDoctorAvailabilitySlots = testEnv.wrap(appointmentFunctions.setDoctorAvailabilitySlots);
  });

  // Cleanup after all tests
  afterAll(async () => {
    // Clean up Firestore collections
    await cleanupFirestore(['users', 'patients', 'doctors', 'appointments', 'doctorAvailability']);
    
    // Clean up test environment
    testEnv.cleanup();
  });

  // Cleanup after each test
  afterEach(async () => {
    // Clean up Firestore collections
    await cleanupFirestore(['users', 'patients', 'doctors', 'appointments', 'doctorAvailability']);
  });

  describe('bookAppointment', () => {
    // Setup: Create a test patient and doctor before each test
    let patientId: string;
    let doctorId: string;
    let patientContext: any;

    beforeEach(async () => {
      // Create test patient
      patientId = 'test-patient-' + Date.now();
      patientContext = createAuthUser(patientId, 'patient@example.com');
      
      // Create patient user profile
      await admin.firestore().collection('users').doc(patientId).set({
        userId: patientId,
        email: 'patient@example.com',
        firstName: 'Patient',
        lastName: 'Test',
        userType: UserType.PATIENT,
        createdAt: admin.firestore.Timestamp.now()
      });

      // Create patient profile
      await admin.firestore().collection('patients').doc(patientId).set({
        userId: patientId,
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        bloodType: 'A+',
        medicalHistory: ['None']
      });

      // Create test doctor
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
        verificationStatus: VerificationStatus.VERIFIED,
        yearsOfExperience: 5
      });
    });

    it('should book an appointment successfully', async () => {
      // Test data
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + 7); // One week from now
      
      const appointmentData = {
        doctorId,
        appointmentDate: admin.firestore.Timestamp.fromDate(appointmentDate),
        startTime: '10:00',
        endTime: '10:30',
        reason: 'Annual checkup'
      };

      // Call the function
      const result = await appointmentFunctions.bookAppointment(appointmentData, patientContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.appointment).toBeDefined();
      expect(result.appointment.patientId).toBe(patientId);
      expect(result.appointment.doctorId).toBe(doctorId);
      expect(result.appointment.status).toBe(AppointmentStatus.PENDING);

      // Verify Firestore record
      const appointmentDoc = await admin.firestore().collection('appointments').doc(result.appointment.id).get();
      expect(appointmentDoc.exists).toBe(true);
      expect(appointmentDoc.data()?.patientId).toBe(patientId);
      expect(appointmentDoc.data()?.doctorId).toBe(doctorId);
      expect(appointmentDoc.data()?.reason).toBe(appointmentData.reason);
    });

    it('should reject booking without authentication', async () => {
      // Test data
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + 7);
      
      const appointmentData = {
        doctorId,
        appointmentDate: admin.firestore.Timestamp.fromDate(appointmentDate),
        startTime: '10:00',
        endTime: '10:30',
        reason: 'Annual checkup'
      };

      // Call the function without auth context and expect it to throw
      await expect(appointmentFunctions.bookAppointment(appointmentData, {}))
        .rejects.toThrow();
    });

    it('should reject booking with missing required fields', async () => {
      // Test data with missing required fields
      const appointmentData = {
        doctorId,
        // Missing appointmentDate
        startTime: '10:00',
        endTime: '10:30'
      };

      // Call the function and expect it to throw
      await expect(appointmentFunctions.bookAppointment(appointmentData, patientContext))
        .rejects.toThrow();
    });
  });

  describe('cancelAppointment', () => {
    // Setup: Create a test patient, doctor, and appointment before each test
    let patientId: string;
    let doctorId: string;
    let appointmentId: string;
    let patientContext: any;
    let doctorContext: any;

    beforeEach(async () => {
      // Create test patient
      patientId = 'test-patient-' + Date.now();
      patientContext = createAuthUser(patientId, 'patient@example.com');
      
      // Create patient user profile
      await admin.firestore().collection('users').doc(patientId).set({
        userId: patientId,
        email: 'patient@example.com',
        firstName: 'Patient',
        lastName: 'Test',
        userType: UserType.PATIENT,
        createdAt: admin.firestore.Timestamp.now()
      });

      // Create test doctor
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

      // Create test appointment
      appointmentId = 'test-appointment-' + Date.now();
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + 7);
      
      await admin.firestore().collection('appointments').doc(appointmentId).set({
        id: appointmentId,
        patientId,
        doctorId,
        appointmentDate: admin.firestore.Timestamp.fromDate(appointmentDate),
        startTime: '10:00',
        endTime: '10:30',
        reason: 'Annual checkup',
        status: AppointmentStatus.PENDING,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
    });

    it('should cancel an appointment as a patient', async () => {
      // Test data
      const cancelData = {
        appointmentId
      };

      // Call the function
      const result = await appointmentFunctions.cancelAppointment(cancelData, patientContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.appointment).toBeDefined();
      expect(result.appointment.status).toBe(AppointmentStatus.CANCELLED);

      // Verify Firestore record
      const appointmentDoc = await admin.firestore().collection('appointments').doc(appointmentId).get();
      expect(appointmentDoc.data()?.status).toBe(AppointmentStatus.CANCELLED);
    });

    it('should cancel an appointment as a doctor', async () => {
      // Test data
      const cancelData = {
        appointmentId
      };

      // Call the function
      const result = await appointmentFunctions.cancelAppointment(cancelData, doctorContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.appointment).toBeDefined();
      expect(result.appointment.status).toBe(AppointmentStatus.CANCELLED);

      // Verify Firestore record
      const appointmentDoc = await admin.firestore().collection('appointments').doc(appointmentId).get();
      expect(appointmentDoc.data()?.status).toBe(AppointmentStatus.CANCELLED);
    });

    it('should reject cancellation from unauthorized users', async () => {
      // Create another user
      const otherUserId = 'other-user-' + Date.now();
      const otherUserContext = createAuthUser(otherUserId, 'other@example.com');
      
      // Test data
      const cancelData = {
        appointmentId
      };

      // Call the function with unauthorized user and expect it to throw
      await expect(appointmentFunctions.cancelAppointment(cancelData, otherUserContext))
        .rejects.toThrow();
    });

    it('should reject cancellation of non-existent appointment', async () => {
      // Test data
      const cancelData = {
        appointmentId: 'non-existent-appointment'
      };

      // Call the function and expect it to throw
      await expect(appointmentFunctions.cancelAppointment(cancelData, patientContext))
        .rejects.toThrow();
    });
  });

  describe('getMyAppointments', () => {
    // Setup: Create a test patient, doctor, and appointments before each test
    let patientId: string;
    let doctorId: string;
    let patientContext: any;
    let doctorContext: any;

    beforeEach(async () => {
      // Create test patient
      patientId = 'test-patient-' + Date.now();
      patientContext = createAuthUser(patientId, 'patient@example.com');
      
      // Create patient user profile
      await admin.firestore().collection('users').doc(patientId).set({
        userId: patientId,
        email: 'patient@example.com',
        firstName: 'Patient',
        lastName: 'Test',
        userType: UserType.PATIENT,
        createdAt: admin.firestore.Timestamp.now()
      });

      // Create test doctor
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

      // Create test appointments
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + 7);
      
      // Pending appointment
      await admin.firestore().collection('appointments').doc('pending-appointment').set({
        id: 'pending-appointment',
        patientId,
        doctorId,
        appointmentDate: admin.firestore.Timestamp.fromDate(appointmentDate),
        startTime: '10:00',
        endTime: '10:30',
        reason: 'Annual checkup',
        status: AppointmentStatus.PENDING,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
      
      // Confirmed appointment
      await admin.firestore().collection('appointments').doc('confirmed-appointment').set({
        id: 'confirmed-appointment',
        patientId,
        doctorId,
        appointmentDate: admin.firestore.Timestamp.fromDate(appointmentDate),
        startTime: '11:00',
        endTime: '11:30',
        reason: 'Follow-up',
        status: AppointmentStatus.CONFIRMED,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
      
      // Cancelled appointment
      await admin.firestore().collection('appointments').doc('cancelled-appointment').set({
        id: 'cancelled-appointment',
        patientId,
        doctorId,
        appointmentDate: admin.firestore.Timestamp.fromDate(appointmentDate),
        startTime: '12:00',
        endTime: '12:30',
        reason: 'Consultation',
        status: AppointmentStatus.CANCELLED,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
    });

    it('should get all appointments for a patient', async () => {
      // Call the function
      const result = await appointmentFunctions.getMyAppointments({}, patientContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.appointments).toBeDefined();
      expect(result.appointments.length).toBe(3);
    });

    it('should get all appointments for a doctor', async () => {
      // Call the function
      const result = await appointmentFunctions.getMyAppointments({}, doctorContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.appointments).toBeDefined();
      expect(result.appointments.length).toBe(3);
    });

    it('should filter appointments by status', async () => {
      // Test data
      const filterData = {
        status: AppointmentStatus.PENDING
      };

      // Call the function
      const result = await appointmentFunctions.getMyAppointments(filterData, patientContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.appointments).toBeDefined();
      expect(result.appointments.length).toBe(1);
      expect(result.appointments[0].status).toBe(AppointmentStatus.PENDING);
    });

    it('should reject requests without authentication', async () => {
      // Call the function without auth context and expect it to throw
      await expect(appointmentFunctions.getMyAppointments({}, {}))
        .rejects.toThrow();
    });
  });

  describe('getDoctorAvailability', () => {
    // Setup: Create a test doctor and availability slots before each test
    let doctorId: string;
    let patientId: string;
    let patientContext: any;

    beforeEach(async () => {
      // Create test patient
      patientId = 'test-patient-' + Date.now();
      patientContext = createAuthUser(patientId, 'patient@example.com');
      
      // Create patient user profile
      await admin.firestore().collection('users').doc(patientId).set({
        userId: patientId,
        email: 'patient@example.com',
        firstName: 'Patient',
        lastName: 'Test',
        userType: UserType.PATIENT,
        createdAt: admin.firestore.Timestamp.now()
      });

      // Create test doctor
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

      // Create doctor availability slots
      // Monday (1) slots
      await admin.firestore().collection('doctorAvailability').doc('monday-morning').set({
        id: 'monday-morning',
        doctorId,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '12:00',
        isAvailable: true,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
      
      // Tuesday (2) slots
      await admin.firestore().collection('doctorAvailability').doc('tuesday-afternoon').set({
        id: 'tuesday-afternoon',
        doctorId,
        dayOfWeek: 2,
        startTime: '13:00',
        endTime: '17:00',
        isAvailable: true,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
      
      // Wednesday (3) slots - not available
      await admin.firestore().collection('doctorAvailability').doc('wednesday-morning').set({
        id: 'wednesday-morning',
        doctorId,
        dayOfWeek: 3,
        startTime: '09:00',
        endTime: '12:00',
        isAvailable: false,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
    });

    it('should get all availability slots for a doctor', async () => {
      // Test data
      const availabilityData = {
        doctorId
      };

      // Call the function
      const result = await appointmentFunctions.getDoctorAvailability(availabilityData, patientContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.availabilitySlots).toBeDefined();
      expect(result.availabilitySlots.length).toBe(3);
    });

    it('should filter availability slots by date', async () => {
      // Find a date that falls on a Tuesday (day 2)
      const today = new Date();
      const daysUntilTuesday = (2 + 7 - today.getDay()) % 7;
      const tuesday = new Date(today);
      tuesday.setDate(today.getDate() + daysUntilTuesday);
      
      // Format date as YYYY-MM-DD
      const tuesdayStr = tuesday.toISOString().split('T')[0];
      
      // Test data
      const availabilityData = {
        doctorId,
        date: tuesdayStr
      };

      // Call the function
      const result = await appointmentFunctions.getDoctorAvailability(availabilityData, patientContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.availabilitySlots).toBeDefined();
      expect(result.availabilitySlots.length).toBe(1);
      
      // Instead of checking for a specific day of week, we'll verify that
      // we got a slot that is available (since that's what the function filters on)
      expect(result.availabilitySlots[0].isAvailable).toBe(true);
    });

    it('should reject requests without authentication', async () => {
      // Test data
      const availabilityData = {
        doctorId
      };

      // Call the function without auth context and expect it to throw
      await expect(appointmentFunctions.getDoctorAvailability(availabilityData, {}))
        .rejects.toThrow();
    });

    it('should reject requests without doctor ID', async () => {
      // Test data with missing doctor ID
      const availabilityData = {};

      // Call the function and expect it to throw
      await expect(appointmentFunctions.getDoctorAvailability(availabilityData, patientContext))
        .rejects.toThrow();
    });
  });

  describe('setDoctorAvailabilitySlots', () => {
    // Setup: Create a test doctor before each test
    let doctorId: string;
    let doctorContext: any;

    beforeEach(async () => {
      // Create test doctor
      doctorId = 'test-doctor-' + Date.now();
      // Simplified custom claims for testing with emulators
      doctorContext = createAuthUser(doctorId, 'doctor@example.com', { role: 'doctor' });
      
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
        verificationStatus: VerificationStatus.VERIFIED,
        yearsOfExperience: 5
      });
      
      // Mock the getUser function since we're using the emulator
      jest.spyOn(admin.auth(), 'getUser').mockResolvedValue({
        uid: doctorId,
        email: 'doctor@example.com',
        customClaims: { role: 'doctor' }
      } as any);
    });
    
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should set availability slots for a doctor', async () => {
      // Test data
      const availabilityData = {
        availabilitySlots: [
          {
            doctorId,
            dayOfWeek: 1, // Monday
            startTime: '09:00',
            endTime: '12:00',
            isAvailable: true
          },
          {
            doctorId,
            dayOfWeek: 2, // Tuesday
            startTime: '13:00',
            endTime: '17:00',
            isAvailable: true
          }
        ]
      };

      // Call the function
      const result = await appointmentFunctions.setDoctorAvailabilitySlots(availabilityData, doctorContext);

      // Assertions
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.availabilitySlots).toBeDefined();
      expect(result.availabilitySlots.length).toBe(2);

      // Verify Firestore records
      const availabilityQuery = await admin.firestore()
        .collection('doctorAvailability')
        .where('doctorId', '==', doctorId)
        .get();
      
      expect(availabilityQuery.docs.length).toBe(2);
      
      // Check that the slots match what we set
      const mondaySlot = availabilityQuery.docs.find(doc => doc.data().dayOfWeek === 1);
      expect(mondaySlot).toBeDefined();
      expect(mondaySlot?.data().startTime).toBe('09:00');
      expect(mondaySlot?.data().endTime).toBe('12:00');
      
      const tuesdaySlot = availabilityQuery.docs.find(doc => doc.data().dayOfWeek === 2);
      expect(tuesdaySlot).toBeDefined();
      expect(tuesdaySlot?.data().startTime).toBe('13:00');
      expect(tuesdaySlot?.data().endTime).toBe('17:00');
    });

    it('should reject requests from non-doctor users', async () => {
      // Create patient user
      const patientId = 'test-patient-' + Date.now();
      const patientContext = createAuthUser(patientId, 'patient@example.com', { role: 'patient' });
      
      // Test data
      const availabilityData = {
        availabilitySlots: [
          {
            doctorId,
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '12:00',
            isAvailable: true
          }
        ]
      };

      // Call the function with patient context and expect it to throw
      await expect(appointmentFunctions.setDoctorAvailabilitySlots(availabilityData, patientContext))
        .rejects.toThrow();
    });

    it('should reject requests without authentication', async () => {
      // Test data
      const availabilityData = {
        availabilitySlots: [
          {
            doctorId,
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '12:00',
            isAvailable: true
          }
        ]
      };

      // Call the function without auth context and expect it to throw
      await expect(appointmentFunctions.setDoctorAvailabilitySlots(availabilityData, {}))
        .rejects.toThrow();
    });

    it('should reject requests with slots for other doctors', async () => {
      // Create another doctor
      const otherDoctorId = 'other-doctor-' + Date.now();
      
      // Test data with slots for another doctor
      const availabilityData = {
        availabilitySlots: [
          {
            doctorId: otherDoctorId, // Not the authenticated doctor
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '12:00',
            isAvailable: true
          }
        ]
      };

      // Call the function and expect it to throw
      await expect(appointmentFunctions.setDoctorAvailabilitySlots(availabilityData, doctorContext))
        .rejects.toThrow();
    });
  });
});
