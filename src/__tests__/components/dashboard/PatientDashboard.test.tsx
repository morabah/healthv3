/**
 * PatientDashboard Component Tests
 * Tests the patient dashboard component with mocked Firebase services
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PatientDashboard from '@/components/dashboard/PatientDashboard';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseFirestore } from '@/lib/firebaseClient';
import { AppointmentStatus, UserType, VerificationStatus } from '@/types/enums';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(date => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 }))
  }
}));

// Mock Firebase Functions
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(),
  httpsCallable: jest.fn(),
}));

// Mock Firebase client
jest.mock('@/lib/firebaseClient', () => ({
  getFirebaseFirestore: jest.fn(() => ({})),
}));

// Mock Auth context
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock logger and performance utilities
jest.mock('@/lib/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

jest.mock('@/lib/performance', () => ({
  trackPerformance: jest.fn(() => ({
    stop: jest.fn(),
  })),
}));

// Mock appointment data
const mockAppointments = [
  {
    id: 'appt1',
    patientId: 'patient1',
    doctorId: 'doctor1',
    doctorName: 'Dr. Jane Smith',
    reason: 'Annual checkup',
    appointmentDate: { seconds: 1714435200, nanoseconds: 0 }, // 2024-04-30
    startTime: '10:00',
    endTime: '10:30',
    status: AppointmentStatus.CONFIRMED,
    createdAt: { seconds: 1713830400, nanoseconds: 0 },
    updatedAt: { seconds: 1713830400, nanoseconds: 0 }
  },
  {
    id: 'appt2',
    patientId: 'patient1',
    doctorId: 'doctor2',
    doctorName: 'Dr. Michael Johnson',
    reason: 'Follow-up consultation',
    appointmentDate: { seconds: 1714521600, nanoseconds: 0 }, // 2024-05-01
    startTime: '14:00',
    endTime: '14:30',
    status: AppointmentStatus.PENDING,
    createdAt: { seconds: 1713830400, nanoseconds: 0 },
    updatedAt: { seconds: 1713830400, nanoseconds: 0 }
  }
];

// Mock doctor data
const mockDoctors = [
  {
    id: 'doctor1',
    userId: 'user1',
    firstName: 'Jane',
    lastName: 'Smith',
    specialization: 'Cardiology',
    verificationStatus: VerificationStatus.VERIFIED,
    photoURL: 'https://example.com/doctor1.jpg'
  },
  {
    id: 'doctor2',
    userId: 'user2',
    firstName: 'Michael',
    lastName: 'Johnson',
    specialization: 'Neurology',
    verificationStatus: VerificationStatus.VERIFIED,
    photoURL: null
  }
];

describe('PatientDashboard Component', () => {
  // Mock query builder functions
  const mockCollection = collection as jest.Mock;
  const mockQuery = query as jest.Mock;
  const mockWhere = where as jest.Mock;
  const mockOrderBy = orderBy as jest.Mock;
  const mockGetDocs = getDocs as jest.Mock;
  const mockGetFirestore = getFirebaseFirestore as jest.Mock;
  const mockUseAuth = useAuth as jest.Mock;
  const mockGetFunctions = getFunctions as jest.Mock;
  const mockHttpsCallable = httpsCallable as jest.Mock;
  const mockTimestampFromDate = Timestamp.fromDate as jest.Mock;
  
  // Mock callback
  const mockOnBookAppointment = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock query chain
    mockCollection.mockImplementation((db, collectionName) => collectionName);
    mockQuery.mockReturnValue('queryResult');
    mockWhere.mockReturnValue('whereClause');
    mockOrderBy.mockReturnValue('orderByClause');
    
    // Setup mock Firestore
    mockGetFirestore.mockReturnValue({});
    
    // Setup mock Functions
    mockGetFunctions.mockReturnValue({});
    const mockCancelAppointment = jest.fn().mockResolvedValue({ data: { success: true } });
    mockHttpsCallable.mockReturnValue(mockCancelAppointment);
    
    // Setup mock Timestamp
    mockTimestampFromDate.mockImplementation(date => ({ 
      seconds: Math.floor(date.getTime() / 1000), 
      nanoseconds: 0 
    }));
    
    // Setup mock auth with patient user
    mockUseAuth.mockReturnValue({
      user: { uid: 'patient1' },
      userProfile: { 
        id: 'patient1',
        userType: UserType.PATIENT,
        firstName: 'John',
        lastName: 'Doe'
      }
    });
    
    // Setup mock getDocs for appointments
    mockGetDocs.mockImplementation((queryResult) => {
      if (queryResult === 'queryResult') {
        // First call is for appointments
        return {
          forEach: (callback: (doc: any) => void) => {
            mockAppointments.forEach(appointment => {
              callback({
                id: appointment.id,
                data: () => ({ ...appointment })
              });
            });
          }
        };
      } else {
        // Second call is for doctors
        return {
          forEach: (callback: (doc: any) => void) => {
            mockDoctors.forEach(doctor => {
              callback({
                id: doctor.id,
                data: () => ({ ...doctor })
              });
            });
          }
        };
      }
    });
  });
  
  it('renders loading state initially', () => {
    render(<PatientDashboard onBookAppointment={mockOnBookAppointment} />);
    
    expect(screen.getByTestId('loading-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });
  
  it('renders dashboard with appointments and doctors', async () => {
    render(<PatientDashboard onBookAppointment={mockOnBookAppointment} />);
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId('patient-dashboard')).toBeInTheDocument();
    });
    
    // Verify appointments section
    expect(screen.getByText('Upcoming Appointments')).toBeInTheDocument();
    expect(screen.getByTestId('appointments-list')).toBeInTheDocument();
    
    // Verify appointment items
    const appointmentItems = screen.getAllByTestId('appointment-item');
    expect(appointmentItems).toHaveLength(2);
    expect(screen.getByText('Annual checkup')).toBeInTheDocument();
    expect(screen.getByText('Follow-up consultation')).toBeInTheDocument();
    
    // Verify doctors section
    expect(screen.getByText('Available Doctors')).toBeInTheDocument();
    expect(screen.getByTestId('doctors-list')).toBeInTheDocument();
    
    // Verify doctor items
    const doctorItems = screen.getAllByTestId('doctor-item');
    expect(doctorItems).toHaveLength(2);
    expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Dr. Michael Johnson')).toBeInTheDocument();
    
    // Verify Firestore queries
    expect(mockCollection).toHaveBeenCalledWith({}, 'appointments');
    expect(mockCollection).toHaveBeenCalledWith({}, 'doctorProfiles');
    
    // Verify appointment query filters
    expect(mockWhere).toHaveBeenCalledWith('patientId', '==', 'patient1');
    expect(mockWhere).toHaveBeenCalledWith('appointmentDate', '>=', expect.anything());
    expect(mockWhere).toHaveBeenCalledWith('status', 'in', [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING]);
    
    // Verify doctor query filters
    expect(mockWhere).toHaveBeenCalledWith('verificationStatus', '==', 'VERIFIED');
    
    // Verify logging
    expect(logInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Fetching patient dashboard data',
        context: 'PatientDashboard'
      })
    );
  });
  
  it('handles empty appointments and doctors', async () => {
    // Mock empty results
    mockGetDocs.mockImplementation(() => ({
      forEach: () => {} // No items
    }));
    
    render(<PatientDashboard onBookAppointment={mockOnBookAppointment} />);
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId('patient-dashboard')).toBeInTheDocument();
    });
    
    // Verify empty appointments message
    expect(screen.getByTestId('no-appointments')).toBeInTheDocument();
    expect(screen.getByText('No upcoming appointments')).toBeInTheDocument();
    
    // Verify empty doctors message
    expect(screen.getByTestId('no-doctors')).toBeInTheDocument();
    expect(screen.getByText('No doctors available at the moment')).toBeInTheDocument();
  });
  
  it('cancels an appointment successfully', async () => {
    render(<PatientDashboard onBookAppointment={mockOnBookAppointment} />);
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId('patient-dashboard')).toBeInTheDocument();
    });
    
    // Get all cancel buttons
    const cancelButtons = screen.getAllByTestId('cancel-button');
    expect(cancelButtons).toHaveLength(2);
    
    // Click the first cancel button
    await userEvent.click(cancelButtons[0]);
    
    // Verify Firebase function was called
    expect(mockHttpsCallable).toHaveBeenCalledWith({}, 'cancelAppointment');
    
    // Verify the function was called with correct parameters
    const mockCancelAppointment = mockHttpsCallable.mock.results[0].value;
    expect(mockCancelAppointment).toHaveBeenCalledWith({ appointmentId: 'appt1' });
    
    // Verify logging
    expect(logInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Cancelling appointment',
        context: 'PatientDashboard',
        data: expect.objectContaining({
          userId: 'patient1',
          appointmentId: 'appt1'
        })
      })
    );
    
    expect(logInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Appointment cancelled successfully',
        context: 'PatientDashboard'
      })
    );
  });
  
  it('handles appointment cancellation errors', async () => {
    // Mock error response
    const mockError = new Error('Failed to cancel appointment');
    const mockCancelAppointment = jest.fn().mockRejectedValueOnce(mockError);
    mockHttpsCallable.mockReturnValue(mockCancelAppointment);
    
    render(<PatientDashboard onBookAppointment={mockOnBookAppointment} />);
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId('patient-dashboard')).toBeInTheDocument();
    });
    
    // Get cancel button and click it
    const cancelButtons = screen.getAllByTestId('cancel-button');
    await userEvent.click(cancelButtons[0]);
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Failed to cancel appointment. Please try again.')).toBeInTheDocument();
    
    // Verify error logging
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Error cancelling appointment',
        context: 'PatientDashboard',
        data: expect.objectContaining({
          userId: 'patient1',
          appointmentId: 'appt1',
          error: mockError
        })
      })
    );
  });
  
  it('handles Firestore query errors', async () => {
    // Mock Firestore error
    const mockError = new Error('Firestore query failed');
    mockGetDocs.mockRejectedValueOnce(mockError);
    
    render(<PatientDashboard onBookAppointment={mockOnBookAppointment} />);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
    
    // Verify error message
    expect(screen.getByText('Failed to load dashboard data. Please try again later.')).toBeInTheDocument();
    
    // Verify error logging
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Error fetching dashboard data',
        context: 'PatientDashboard',
        data: expect.objectContaining({
          userId: 'patient1',
          error: mockError
        })
      })
    );
  });
  
  it('calls onBookAppointment when Book New button is clicked', async () => {
    render(<PatientDashboard onBookAppointment={mockOnBookAppointment} />);
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId('patient-dashboard')).toBeInTheDocument();
    });
    
    // Click Book New button
    const bookButton = screen.getByTestId('book-appointment-button');
    await userEvent.click(bookButton);
    
    // Verify callback was called
    expect(mockOnBookAppointment).toHaveBeenCalledTimes(1);
  });
  
  it('does not load data for non-patient users', async () => {
    // Mock doctor user
    mockUseAuth.mockReturnValue({
      user: { uid: 'doctor1' },
      userProfile: { 
        id: 'doctor1',
        userType: UserType.DOCTOR,
        firstName: 'Jane',
        lastName: 'Smith'
      }
    });
    
    render(<PatientDashboard onBookAppointment={mockOnBookAppointment} />);
    
    // Component should not make any Firestore calls
    expect(mockCollection).not.toHaveBeenCalled();
    expect(mockGetDocs).not.toHaveBeenCalled();
  });
  
  it('matches snapshot', async () => {
    const { container } = render(<PatientDashboard onBookAppointment={mockOnBookAppointment} />);
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId('patient-dashboard')).toBeInTheDocument();
    });
    
    expect(container).toMatchSnapshot();
  });
});
