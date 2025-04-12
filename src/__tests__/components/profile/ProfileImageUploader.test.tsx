/**
 * ProfileImageUploader Component Tests
 * Tests the profile image uploader component with mocked Firebase Storage
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProfileImageUploader from '@/components/profile/ProfileImageUploader';
import { useAuth } from '@/context/AuthContext';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';

// Mock Firebase Storage
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
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

describe('ProfileImageUploader Component', () => {
  // Mock functions
  const mockGetStorage = getStorage as jest.Mock;
  const mockRef = ref as jest.Mock;
  const mockUploadBytesResumable = uploadBytesResumable as jest.Mock;
  const mockGetDownloadURL = getDownloadURL as jest.Mock;
  const mockDeleteObject = deleteObject as jest.Mock;
  const mockUseAuth = useAuth as jest.Mock;
  const mockOnImageUploaded = jest.fn();
  const mockOnImageDeleted = jest.fn();
  
  // Default props
  const defaultProps = {
    onImageUploaded: mockOnImageUploaded,
    onImageDeleted: mockOnImageDeleted,
  };
  
  // Mock file
  const createMockFile = (type = 'image/jpeg', size = 1024 * 1024) => {
    const file = new File(['mock-content'], 'profile.jpg', { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      user: { uid: 'user123' }
    });
    
    // Mock storage functions
    mockGetStorage.mockReturnValue({});
    mockRef.mockReturnValue('storageRef');
    
    // Mock upload task
    const mockUploadTask = {
      on: jest.fn((event, progressCallback, errorCallback, completeCallback) => {
        // Simulate successful upload by default
        progressCallback({ bytesTransferred: 100, totalBytes: 100 });
        completeCallback();
      }),
      snapshot: {
        ref: 'uploadTaskRef'
      }
    };
    
    mockUploadBytesResumable.mockReturnValue(mockUploadTask);
    mockGetDownloadURL.mockResolvedValue('https://example.com/profile.jpg');
    mockDeleteObject.mockResolvedValue(undefined);
  });
  
  it('renders without a current image', () => {
    render(<ProfileImageUploader {...defaultProps} />);
    
    // Should show default icon
    expect(screen.getByTestId('default-icon')).toBeInTheDocument();
    
    // Should show upload button with correct text
    expect(screen.getByTestId('upload-button')).toHaveTextContent('Upload Photo');
    
    // Should not show delete button
    expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
  });
  
  it('renders with a current image', () => {
    render(
      <ProfileImageUploader 
        {...defaultProps} 
        currentImageUrl="https://example.com/existing.jpg" 
      />
    );
    
    // Should show the image
    const profileImage = screen.getByTestId('profile-image');
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute('src', 'https://example.com/existing.jpg');
    
    // Should show upload button with "Change Photo" text
    expect(screen.getByTestId('upload-button')).toHaveTextContent('Change Photo');
    
    // Should show delete button
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });
  
  it('opens file dialog when upload button is clicked', async () => {
    render(<ProfileImageUploader {...defaultProps} />);
    
    const fileInput = screen.getByTestId('file-input');
    const uploadButton = screen.getByTestId('upload-button');
    
    // Mock the click function of the file input
    const clickSpy = jest.spyOn(fileInput, 'click');
    
    // Click the upload button
    await userEvent.click(uploadButton);
    
    // Verify file input click was triggered
    expect(clickSpy).toHaveBeenCalled();
  });
  
  it('uploads an image file successfully', async () => {
    render(<ProfileImageUploader {...defaultProps} />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = createMockFile();
    
    // Simulate file selection
    await userEvent.upload(fileInput, file);
    
    // Verify storage functions were called correctly
    expect(mockGetStorage).toHaveBeenCalled();
    expect(mockRef).toHaveBeenCalledWith({}, 'profile-images/user123');
    expect(mockUploadBytesResumable).toHaveBeenCalledWith('storageRef', file);
    
    // Verify download URL was fetched
    expect(mockGetDownloadURL).toHaveBeenCalledWith('uploadTaskRef');
    
    // Verify callback was called with the download URL
    await waitFor(() => {
      expect(mockOnImageUploaded).toHaveBeenCalledWith('https://example.com/profile.jpg');
    });
    
    // Verify logging
    expect(logInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Starting profile image upload',
        context: 'ProfileImageUploader'
      })
    );
    
    expect(logInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Profile image uploaded successfully',
        context: 'ProfileImageUploader'
      })
    );
  });
  
  it('shows upload progress', async () => {
    // Mock upload task with progress updates
    const progressUpdates = [
      { bytesTransferred: 25, totalBytes: 100 }, // 25%
      { bytesTransferred: 50, totalBytes: 100 }, // 50%
      { bytesTransferred: 75, totalBytes: 100 }, // 75%
      { bytesTransferred: 100, totalBytes: 100 } // 100%
    ];
    
    let progressCallback: any;
    let completeCallback: any;
    
    mockUploadBytesResumable.mockReturnValue({
      on: jest.fn((event, onProgress, onError, onComplete) => {
        progressCallback = onProgress;
        completeCallback = onComplete;
      }),
      snapshot: {
        ref: 'uploadTaskRef'
      }
    });
    
    render(<ProfileImageUploader {...defaultProps} />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = createMockFile();
    
    // Simulate file selection
    await userEvent.upload(fileInput, file);
    
    // Simulate progress updates
    progressCallback(progressUpdates[0]);
    
    // Check for progress indicator
    await waitFor(() => {
      const progressText = screen.getByText('25%');
      expect(progressText).toBeInTheDocument();
    });
    
    // Complete the upload
    completeCallback();
    
    // Verify callback was called
    await waitFor(() => {
      expect(mockOnImageUploaded).toHaveBeenCalled();
    });
  });
  
  it('handles non-image file upload attempts', async () => {
    render(<ProfileImageUploader {...defaultProps} />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['mock-content'], 'document.pdf', { type: 'application/pdf' });
    
    // Simulate file selection
    await userEvent.upload(fileInput, file);
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please select an image file (PNG, JPG, JPEG)');
    });
    
    // Verify storage functions were not called
    expect(mockUploadBytesResumable).not.toHaveBeenCalled();
  });
  
  it('handles oversized file upload attempts', async () => {
    render(<ProfileImageUploader {...defaultProps} />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = createMockFile('image/jpeg', 6 * 1024 * 1024); // 6MB file (over the 5MB limit)
    
    // Simulate file selection
    await userEvent.upload(fileInput, file);
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Image size should be less than 5MB');
    });
    
    // Verify storage functions were not called
    expect(mockUploadBytesResumable).not.toHaveBeenCalled();
  });
  
  it('handles upload errors', async () => {
    // Mock upload task with error
    const mockError = new Error('Network error');
    
    let errorCallback: any;
    
    mockUploadBytesResumable.mockReturnValue({
      on: jest.fn((event, onProgress, onError) => {
        errorCallback = onError;
      }),
      snapshot: {
        ref: 'uploadTaskRef'
      }
    });
    
    render(<ProfileImageUploader {...defaultProps} />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = createMockFile();
    
    // Simulate file selection
    await userEvent.upload(fileInput, file);
    
    // Simulate upload error
    errorCallback(mockError);
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to upload image. Please try again.');
    });
    
    // Verify error logging
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Profile image upload failed',
        context: 'ProfileImageUploader',
        data: expect.objectContaining({
          userId: 'user123',
          error: mockError
        })
      })
    );
    
    // Verify callback was not called
    expect(mockOnImageUploaded).not.toHaveBeenCalled();
  });
  
  it('deletes an existing image', async () => {
    render(
      <ProfileImageUploader 
        {...defaultProps} 
        currentImageUrl="https://example.com/existing.jpg" 
      />
    );
    
    const deleteButton = screen.getByTestId('delete-button');
    
    // Click delete button
    await userEvent.click(deleteButton);
    
    // Verify storage functions were called correctly
    expect(mockGetStorage).toHaveBeenCalled();
    expect(mockRef).toHaveBeenCalledWith({}, 'profile-images/user123');
    expect(mockDeleteObject).toHaveBeenCalledWith('storageRef');
    
    // Verify callback was called
    await waitFor(() => {
      expect(mockOnImageDeleted).toHaveBeenCalled();
    });
    
    // Verify logging
    expect(logInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Deleting profile image',
        context: 'ProfileImageUploader'
      })
    );
    
    expect(logInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Profile image deleted successfully',
        context: 'ProfileImageUploader'
      })
    );
  });
  
  it('handles delete errors', async () => {
    // Mock delete error
    const mockError = new Error('Permission denied');
    mockDeleteObject.mockRejectedValueOnce(mockError);
    
    render(
      <ProfileImageUploader 
        {...defaultProps} 
        currentImageUrl="https://example.com/existing.jpg" 
      />
    );
    
    const deleteButton = screen.getByTestId('delete-button');
    
    // Click delete button
    await userEvent.click(deleteButton);
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Permission denied');
    });
    
    // Verify error logging
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Error deleting profile image',
        context: 'ProfileImageUploader',
        data: expect.objectContaining({
          userId: 'user123',
          error: mockError
        })
      })
    );
    
    // Verify callback was not called
    expect(mockOnImageDeleted).not.toHaveBeenCalled();
  });
  
  it('handles missing user', async () => {
    // Mock unauthenticated state
    mockUseAuth.mockReturnValue({
      user: null
    });
    
    render(
      <ProfileImageUploader 
        {...defaultProps} 
        currentImageUrl="https://example.com/existing.jpg" 
      />
    );
    
    const fileInput = screen.getByTestId('file-input');
    const file = createMockFile();
    
    // Simulate file selection
    await userEvent.upload(fileInput, file);
    
    // Verify storage functions were not called
    expect(mockUploadBytesResumable).not.toHaveBeenCalled();
    
    // Click delete button
    const deleteButton = screen.getByTestId('delete-button');
    await userEvent.click(deleteButton);
    
    // Verify delete was not called
    expect(mockDeleteObject).not.toHaveBeenCalled();
  });
  
  it('matches snapshot', () => {
    const { container } = render(<ProfileImageUploader {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});
