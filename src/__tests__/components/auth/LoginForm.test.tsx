/**
 * LoginForm Component Tests
 * Tests the login form component with Firebase auth emulator
 */
import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LoginForm from '@/components/auth/LoginForm';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { logInfo, logError } from '@/lib/logger';

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
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

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    const { getByLabelText, getByRole } = render(<LoginForm />);
    
    expect(getByLabelText(/email/i)).toBeInTheDocument();
    expect(getByLabelText(/password/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    const mockSignIn = signInWithEmailAndPassword as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ user: { email: 'test@example.com' } });
    
    const { getByLabelText, getByRole } = render(<LoginForm />);
    const user = userEvent.setup();
    
    // Fill in valid data
    await user.type(getByLabelText(/email/i), 'test@example.com');
    await user.type(getByLabelText(/password/i), 'Password123!');
    
    // Submit the form
    await user.click(getByRole('button', { name: /sign in/i }));
    
    // Check if Firebase auth was called with correct parameters
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'Password123!'
      );
    });
    
    // Verify logging
    expect(logInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Login attempt',
        context: 'LoginForm',
        data: expect.objectContaining({ email: 'test@example.com' })
      })
    );
    
    expect(logInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Login successful',
        context: 'LoginForm'
      })
    );
  });
  
  it('shows validation errors for empty fields', async () => {
    const { getByRole, getByText } = render(<LoginForm />);
    const user = userEvent.setup();
    
    // Submit form without filling any fields
    await user.click(getByRole('button', { name: /sign in/i }));
    
    // Check for validation error messages
    expect(getByText('Email is required')).toBeInTheDocument();
    expect(getByText('Password is required')).toBeInTheDocument();
    
    // Verify Firebase auth was not called
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });
  
  it('validates email format', async () => {
    const { getByLabelText, getByRole, getByText } = render(<LoginForm />);
    const user = userEvent.setup();
    
    // Fill in invalid email format
    await user.type(getByLabelText(/email/i), 'invalid-email');
    await user.type(getByLabelText(/password/i), 'Password123!');
    
    // Submit the form
    await user.click(getByRole('button', { name: /sign in/i }));
    
    // Check for validation error message
    expect(getByText('Please enter a valid email address')).toBeInTheDocument();
    
    // Verify Firebase auth was not called
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });
  
  it('handles Firebase auth "user not found" error', async () => {
    const mockSignIn = signInWithEmailAndPassword as jest.Mock;
    mockSignIn.mockRejectedValueOnce({ code: 'auth/user-not-found', message: 'User not found' });
    
    const { getByLabelText, getByRole, findByText } = render(<LoginForm />);
    const user = userEvent.setup();
    
    // Fill in valid data
    await user.type(getByLabelText(/email/i), 'nonexistent@example.com');
    await user.type(getByLabelText(/password/i), 'Password123!');
    
    // Submit the form
    await user.click(getByRole('button', { name: /sign in/i }));
    
    // Check for error message
    const errorMessage = await findByText('No account found with this email address');
    expect(errorMessage).toBeInTheDocument();
    
    // Verify logging
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Login failed',
        context: 'LoginForm',
        data: expect.objectContaining({ 
          errorCode: 'auth/user-not-found'
        })
      })
    );
  });
  
  it('handles Firebase auth "wrong password" error', async () => {
    const mockSignIn = signInWithEmailAndPassword as jest.Mock;
    mockSignIn.mockRejectedValueOnce({ code: 'auth/wrong-password', message: 'Wrong password' });
    
    const { getByLabelText, getByRole, findByText } = render(<LoginForm />);
    const user = userEvent.setup();
    
    // Fill in valid data with wrong password
    await user.type(getByLabelText(/email/i), 'test@example.com');
    await user.type(getByLabelText(/password/i), 'WrongPassword123!');
    
    // Submit the form
    await user.click(getByRole('button', { name: /sign in/i }));
    
    // Check for error message
    const errorMessage = await findByText('Invalid password');
    expect(errorMessage).toBeInTheDocument();
  });
  
  it('handles Firebase auth "too many requests" error', async () => {
    const mockSignIn = signInWithEmailAndPassword as jest.Mock;
    mockSignIn.mockRejectedValueOnce({ code: 'auth/too-many-requests', message: 'Too many requests' });
    
    const { getByLabelText, getByRole, findByText } = render(<LoginForm />);
    const user = userEvent.setup();
    
    // Fill in valid data
    await user.type(getByLabelText(/email/i), 'test@example.com');
    await user.type(getByLabelText(/password/i), 'Password123!');
    
    // Submit the form
    await user.click(getByRole('button', { name: /sign in/i }));
    
    // Check for error message
    const errorMessage = await findByText('Too many failed login attempts. Please try again later');
    expect(errorMessage).toBeInTheDocument();
  });
  
  it('disables form inputs and shows loading state during submission', async () => {
    // Use a promise that we can resolve manually to control the timing
    let resolvePromise: (value: any) => void;
    const authPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    const mockSignIn = signInWithEmailAndPassword as jest.Mock;
    mockSignIn.mockReturnValueOnce(authPromise);
    
    const { getByLabelText, getByRole } = render(<LoginForm />);
    const user = userEvent.setup();
    
    // Fill in valid data
    await user.type(getByLabelText(/email/i), 'test@example.com');
    await user.type(getByLabelText(/password/i), 'Password123!');
    
    // Submit the form
    await user.click(getByRole('button', { name: /sign in/i }));
    
    // Check loading state
    const emailInput = getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = getByLabelText(/password/i) as HTMLInputElement;
    const submitButton = getByRole('button', { name: /sign in/i });
    
    expect(emailInput.disabled).toBe(true);
    expect(passwordInput.disabled).toBe(true);
    expect(submitButton).toBeDisabled();
    
    // Resolve the auth promise
    resolvePromise!({ user: { email: 'test@example.com' } });
    
    // Wait for the form to return to normal state
    await waitFor(() => {
      expect(emailInput.disabled).toBe(false);
      expect(passwordInput.disabled).toBe(false);
      expect(submitButton).not.toBeDisabled();
    });
  });
  
  it('matches snapshot', () => {
    const { container } = render(<LoginForm />);
    expect(container).toMatchSnapshot();
  });
});
