/**
 * DoctorVerification Component Tests
 * Tests the doctor verification component with mocked Firebase Functions
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DoctorVerification from '@/components/admin/DoctorVerification';
import { VerificationStatus } from '@/types/enums';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';

// Mock Firebase Functions
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(),
  httpsCallable: jest.fn(),
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

describe('DoctorVerification Component', () => {
  const mockGetFunctions = getFunctions as jest.Mock;
  const mockHttpsCallable = httpsCallable as jest.Mock;
  const mockOnVerificationComplete = jest.fn();
  
  // Default props for the component
  const defaultProps = {
    doctorId: 'doctor123',
    currentStatus: VerificationStatus.PENDING,
    doctorName: 'Dr. John Smith',
    onVerificationComplete: mockOnVerificationComplete,
  };
  
  // Mock function response
  const mockAdminVerifyDoctor = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock functions
    mockGetFunctions.mockReturnValue({});
    mockHttpsCallable.mockReturnValue(mockAdminVerifyDoctor);
    
    // Default success response
    mockAdminVerifyDoctor.mockResolvedValue({
      data: { success: true }
    });
  });
  
  it('renders correctly with pending status', () => {
    render(<DoctorVerification {...defaultProps} />);
    
    // Check component renders with correct doctor name
    expect(screen.getByText(`Verify Doctor: ${defaultProps.doctorName}`)).toBeInTheDocument();
    
    // Check current status is displayed
    expect(screen.getByText('Current Status:')).toBeInTheDocument();
    expect(screen.getByText(VerificationStatus.PENDING)).toBeInTheDocument();
    
    // Check buttons are enabled
    expect(screen.getByTestId('approve-button')).not.toBeDisabled();
    expect(screen.getByTestId('reject-button')).not.toBeDisabled();
  });
  
  it('disables approve button when status is already VERIFIED', () => {
    render(
      <DoctorVerification 
        {...defaultProps} 
        currentStatus={VerificationStatus.VERIFIED} 
      />
    );
    
    // Approve button should be disabled
    expect(screen.getByTestId('approve-button')).toBeDisabled();
    
    // Reject button should be enabled
    expect(screen.getByTestId('reject-button')).not.toBeDisabled();
  });
  
  it('disables reject button when status is already REJECTED', () => {
    render(
      <DoctorVerification 
        {...defaultProps} 
        currentStatus={VerificationStatus.REJECTED} 
      />
    );
    
    // Approve button should be enabled
    expect(screen.getByTestId('approve-button')).not.toBeDisabled();
    
    // Reject button should be disabled
    expect(screen.getByTestId('reject-button')).toBeDisabled();
  });
  
  it('allows entering verification notes', async () => {
    render(<DoctorVerification {...defaultProps} />);
    
    // Type notes in the textarea
    const notesInput = screen.getByTestId('verification-notes');
    await userEvent.type(notesInput, 'Verified credentials with medical board');
    
    expect(notesInput).toHaveValue('Verified credentials with medical board');
  });
  
  it('calls Firebase function when approving a doctor', async () => {
    render(<DoctorVerification {...defaultProps} />);
    
    // Enter verification notes
    const notesInput = screen.getByTestId('verification-notes');
    await userEvent.type(notesInput, 'All credentials verified');
    
    // Click approve button
    const approveButton = screen.getByTestId('approve-button');
    await userEvent.click(approveButton);
    
    // Verify Firebase function was called with correct parameters
    expect(mockHttpsCallable).toHaveBeenCalledWith({}, 'adminVerifyDoctor');
    expect(mockAdminVerifyDoctor).toHaveBeenCalledWith({
      doctorId: defaultProps.doctorId,
      status: VerificationStatus.VERIFIED,
      notes: 'All credentials verified'
    });
    
    // Verify callback was called
    await waitFor(() => {
      expect(mockOnVerificationComplete).toHaveBeenCalledWith(VerificationStatus.VERIFIED);
    });
    
    // Verify logging
    expect(logInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Doctor verification process started',
        context: 'DoctorVerification',
        data: expect.objectContaining({
          doctorId: defaultProps.doctorId,
          status: VerificationStatus.VERIFIED
        })
      })
    );
    
    expect(logInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Doctor verification completed successfully',
        context: 'DoctorVerification'
      })
    );
  });
  
  it('calls Firebase function when rejecting a doctor', async () => {
    render(<DoctorVerification {...defaultProps} />);
    
    // Enter verification notes
    const notesInput = screen.getByTestId('verification-notes');
    await userEvent.type(notesInput, 'Unable to verify credentials');
    
    // Click reject button
    const rejectButton = screen.getByTestId('reject-button');
    await userEvent.click(rejectButton);
    
    // Verify Firebase function was called with correct parameters
    expect(mockHttpsCallable).toHaveBeenCalledWith({}, 'adminVerifyDoctor');
    expect(mockAdminVerifyDoctor).toHaveBeenCalledWith({
      doctorId: defaultProps.doctorId,
      status: VerificationStatus.REJECTED,
      notes: 'Unable to verify credentials'
    });
    
    // Verify callback was called
    await waitFor(() => {
      expect(mockOnVerificationComplete).toHaveBeenCalledWith(VerificationStatus.REJECTED);
    });
  });
  
  it('handles empty notes correctly', async () => {
    render(<DoctorVerification {...defaultProps} />);
    
    // Leave notes empty
    
    // Click approve button
    const approveButton = screen.getByTestId('approve-button');
    await userEvent.click(approveButton);
    
    // Verify Firebase function was called with undefined notes
    expect(mockAdminVerifyDoctor).toHaveBeenCalledWith({
      doctorId: defaultProps.doctorId,
      status: VerificationStatus.VERIFIED,
      notes: undefined
    });
  });
  
  it('handles Firebase function errors', async () => {
    // Mock error response
    const mockError = new Error('Permission denied');
    mockAdminVerifyDoctor.mockRejectedValueOnce(mockError);
    
    render(<DoctorVerification {...defaultProps} />);
    
    // Click approve button
    const approveButton = screen.getByTestId('approve-button');
    await userEvent.click(approveButton);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
    
    // Verify error message
    expect(screen.getByText('Permission denied')).toBeInTheDocument();
    
    // Verify error logging
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Doctor verification failed',
        context: 'DoctorVerification',
        data: expect.objectContaining({
          doctorId: defaultProps.doctorId,
          status: VerificationStatus.VERIFIED,
          error: mockError
        })
      })
    );
    
    // Verify callback was not called
    expect(mockOnVerificationComplete).not.toHaveBeenCalled();
  });
  
  it('handles Firebase function errors without message', async () => {
    // Mock error response without message
    mockAdminVerifyDoctor.mockRejectedValueOnce({});
    
    render(<DoctorVerification {...defaultProps} />);
    
    // Click approve button
    const approveButton = screen.getByTestId('approve-button');
    await userEvent.click(approveButton);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
    
    // Verify default error message
    expect(screen.getByText('Failed to update verification status')).toBeInTheDocument();
  });
  
  it('disables inputs during loading state', async () => {
    // Make the Firebase function delay to test loading state
    mockAdminVerifyDoctor.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ data: { success: true } }), 100);
      });
    });
    
    render(<DoctorVerification {...defaultProps} />);
    
    // Click approve button
    const approveButton = screen.getByTestId('approve-button');
    await userEvent.click(approveButton);
    
    // Verify buttons are disabled during loading
    expect(approveButton).toBeDisabled();
    expect(screen.getByTestId('reject-button')).toBeDisabled();
    
    // Verify textarea is disabled during loading
    expect(screen.getByTestId('verification-notes')).toBeDisabled();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(mockOnVerificationComplete).toHaveBeenCalled();
    });
  });
  
  it('matches snapshot', () => {
    const { container } = render(<DoctorVerification {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});
