/**
 * AppointmentList Component Tests
 * Tests the appointment list component with mocked Firestore and Auth
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppointmentList from '@/components/appointments/AppointmentList';
import { AppointmentStatus, UserType } from '@/types/enums';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebaseClient';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
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
    reason: 'Follow-up consultation',
    appointmentDate: { seconds: 1714521600, nanoseconds: 0 }, // 2024-05-01
    startTime: '14:00',
    endTime: '14:30',
    status: AppointmentStatus.PENDING,
    createdAt: { seconds: 1713830400, nanoseconds: 0 },
    updatedAt: { seconds: 1713830400, nanoseconds: 0 }
  },
  {
    id: 'appt3',
    patientId: 'patient1',
    doctorId: 'doctor1',
    reason: 'Vaccination',
    appointmentDate: { seconds: 1714608000, nanoseconds: 0 }, // 2024-05-02
    startTime: '11:00',
    endTime: '11:15',
    status: AppointmentStatus.CANCELLED,
    createdAt: { seconds: 1713830400, nanoseconds: 0 },
    updatedAt: { seconds: 1713830400, nanoseconds: 0 }
  }
];

describe('AppointmentList Component', () => {
  // Mock query builder functions
  const mockCollection = collection as jest.Mock;
  const mockQuery = query as jest.Mock;
  const mockWhere = where as jest.Mock;
  const mockOrderBy = orderBy as jest.Mock;
  const mockGetDocs = getDocs as jest.Mock;
  const mockGetFirestore = getFirebaseFirestore as jest.Mock;
  const mockUseAuth = useAuth as jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock query chain
    mockCollection.mockReturnValue('appointmentsRef');
    mockQuery.mockReturnValue('appointmentsQuery');
    mockWhere.mockReturnValue('whereQuery');
    mockOrderBy.mockReturnValue('orderByQuery');
    
    // Setup mock Firestore
    mockGetFirestore.mockReturnValue({});
    
    // Setup mock getDocs response
    mockGetDocs.mockResolvedValue({
      forEach: (callback: (doc: any) => void) => {
        mockAppointments.forEach(appointment => {
          callback({
            id: appointment.id,
            data: () => ({ ...appointment })
          });
        });
      }
    });
  });
  
  it('renders loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userProfile: null,
      loading: true
    });
    
    render(<AppointmentList />);
    
    expect(screen.getByTestId('loading-auth')).toBeInTheDocument();
    expect(screen.getByText('Loading user information...')).toBeInTheDocument();
  });
  
  it('renders message when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userProfile: null,
      loading: false
    });
    
    render(<AppointmentList />);
    
    expect(screen.getByTestId('no-auth')).toBeInTheDocument();
    expect(screen.getByText('Please log in to view your appointments')).toBeInTheDocument();
  });
  
  it('renders appointments for a patient user', async () => {
    // Mock authenticated patient user
    mockUseAuth.mockReturnValue({
      user: { uid: 'patient1' },
      userProfile: { userType: UserType.PATIENT },
      loading: false
    });
    
    render(<AppointmentList />);
    
    // Should show loading initially
    expect(screen.getByTestId('loading-appointments')).toBeInTheDocument();
    
    // Wait for appointments to load
    await waitFor(() => {
      expect(screen.getByTestId('appointments-list')).toBeInTheDocument();
    });
    
    // Verify Firestore queries
    expect(mockCollection).toHaveBeenCalledWith({}, 'appointments');
    expect(mockWhere).toHaveBeenCalledWith('patientId', '==', 'patient1');
    expect(mockOrderBy).toHaveBeenCalledWith('appointmentDate', 'desc');
    
    // Verify appointments are displayed
    const appointmentItems = screen.getAllByTestId('appointment-item');
    expect(appointmentItems).toHaveLength(3);
    
    // Check specific appointment content
    expect(screen.getByText('Annual checkup')).toBeInTheDocument();
    expect(screen.getByText('Follow-up consultation')).toBeInTheDocument();
    expect(screen.getByText('Vaccination')).toBeInTheDocument();
    
    // Verify logging
    expect(logInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Fetching appointments',
        context: 'AppointmentList'
      })
    );
    
    expect(logInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Appointments fetched successfully',
        context: 'AppointmentList'
      })
    );
  });
  
  it('renders appointments for a doctor user', async () => {
    // Mock authenticated doctor user
    mockUseAuth.mockReturnValue({
      user: { uid: 'doctor1' },
      userProfile: { userType: UserType.DOCTOR },
      loading: false
    });
    
    render(<AppointmentList />);
    
    // Wait for appointments to load
    await waitFor(() => {
      expect(screen.getByTestId('appointments-list')).toBeInTheDocument();
    });
    
    // Verify Firestore queries
    expect(mockCollection).toHaveBeenCalledWith({}, 'appointments');
    expect(mockWhere).toHaveBeenCalledWith('doctorId', '==', 'doctor1');
    expect(mockOrderBy).toHaveBeenCalledWith('appointmentDate', 'desc');
  });
  
  it('filters appointments by status', async () => {
    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      user: { uid: 'patient1' },
      userProfile: { userType: UserType.PATIENT },
      loading: false
    });
    
    // Filter by CONFIRMED status
    render(<AppointmentList status={AppointmentStatus.CONFIRMED} />);
    
    // Wait for appointments to load
    await waitFor(() => {
      expect(screen.getByTestId('appointments-list')).toBeInTheDocument();
    });
    
    // Verify status filter was applied
    expect(mockWhere).toHaveBeenCalledWith('status', '==', AppointmentStatus.CONFIRMED);
    
    // Verify title includes status
    expect(screen.getByText(`Your Appointments (${AppointmentStatus.CONFIRMED})`)).toBeInTheDocument();
  });
  
  it('limits the number of appointments displayed', async () => {
    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      user: { uid: 'patient1' },
      userProfile: { userType: UserType.PATIENT },
      loading: false
    });
    
    // Set limit to 2
    render(<AppointmentList limit={2} />);
    
    // Wait for appointments to load
    await waitFor(() => {
      expect(screen.getByTestId('appointments-list')).toBeInTheDocument();
    });
    
    // Only 2 appointments should be displayed (out of 3 total)
    const appointmentItems = screen.getAllByTestId('appointment-item');
    expect(appointmentItems).toHaveLength(2);
  });
  
  it('handles Firestore query errors', async () => {
    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      user: { uid: 'patient1' },
      userProfile: { userType: UserType.PATIENT },
      loading: false
    });
    
    // Mock Firestore error
    const mockError = new Error('Firestore query failed');
    mockGetDocs.mockRejectedValueOnce(mockError);
    
    render(<AppointmentList />);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
    
    // Verify error message
    expect(screen.getByText('Failed to load appointments. Please try again later.')).toBeInTheDocument();
    
    // Verify error logging
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Error fetching appointments',
        context: 'AppointmentList',
        data: expect.objectContaining({ error: mockError })
      })
    );
  });
  
  it('displays message when no appointments are found', async () => {
    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      user: { uid: 'patient1' },
      userProfile: { userType: UserType.PATIENT },
      loading: false
    });
    
    // Mock empty appointments list
    mockGetDocs.mockResolvedValueOnce({
      forEach: () => {} // No appointments
    });
    
    render(<AppointmentList />);
    
    // Wait for no-appointments message to appear
    await waitFor(() => {
      expect(screen.getByTestId('no-appointments')).toBeInTheDocument();
    });
    
    // Verify message
    expect(screen.getByText('No appointments found')).toBeInTheDocument();
  });
  
  it('matches snapshot', async () => {
    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      user: { uid: 'patient1' },
      userProfile: { userType: UserType.PATIENT },
      loading: false
    });
    
    const { container } = render(<AppointmentList />);
    
    // Wait for appointments to load
    await waitFor(() => {
      expect(screen.getByTestId('appointments-list')).toBeInTheDocument();
    });
    
    expect(container).toMatchSnapshot();
  });
});
