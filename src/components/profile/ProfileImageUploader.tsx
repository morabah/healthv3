/**
 * ProfileImageUploader Component
 * Allows users to upload and manage their profile image
 */
import React, { useState, useRef } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUpload, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';

interface ProfileImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageDeleted?: () => void;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  currentImageUrl,
  onImageUploaded,
  onImageDeleted
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (PNG, JPG, JPEG)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    
    const perfTracker = trackPerformance('uploadProfileImage', 'ProfileImageUploader');
    
    try {
      logInfo({
        message: 'Starting profile image upload',
        context: 'ProfileImageUploader',
        data: { userId: user.uid, fileSize: file.size, fileType: file.type }
      });
      
      const storage = getStorage();
      const storageRef = ref(storage, `profile-images/${user.uid}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Listen for upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          logError({
            message: 'Profile image upload failed',
            context: 'ProfileImageUploader',
            data: { userId: user.uid, error }
          });
          
          setError('Failed to upload image. Please try again.');
          setUploading(false);
          perfTracker.stop({ error: true });
        },
        async () => {
          // Upload completed successfully
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          logInfo({
            message: 'Profile image uploaded successfully',
            context: 'ProfileImageUploader',
            data: { userId: user.uid, downloadUrl }
          });
          
          onImageUploaded(downloadUrl);
          setUploading(false);
          perfTracker.stop({ success: true });
        }
      );
    } catch (error: any) {
      logError({
        message: 'Error in profile image upload',
        context: 'ProfileImageUploader',
        data: { userId: user.uid, error }
      });
      
      setError(error.message || 'An unexpected error occurred');
      setUploading(false);
      perfTracker.stop({ error: true });
    }
  };
  
  const handleDeleteImage = async () => {
    if (!user || !currentImageUrl) return;
    
    setUploading(true);
    setError(null);
    
    const perfTracker = trackPerformance('deleteProfileImage', 'ProfileImageUploader');
    
    try {
      logInfo({
        message: 'Deleting profile image',
        context: 'ProfileImageUploader',
        data: { userId: user.uid, imageUrl: currentImageUrl }
      });
      
      const storage = getStorage();
      const storageRef = ref(storage, `profile-images/${user.uid}`);
      
      await deleteObject(storageRef);
      
      logInfo({
        message: 'Profile image deleted successfully',
        context: 'ProfileImageUploader',
        data: { userId: user.uid }
      });
      
      if (onImageDeleted) {
        onImageDeleted();
      }
      
      perfTracker.stop({ success: true });
    } catch (error: any) {
      logError({
        message: 'Error deleting profile image',
        context: 'ProfileImageUploader',
        data: { userId: user.uid, error }
      });
      
      setError(error.message || 'Failed to delete image');
      perfTracker.stop({ error: true });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="profile-image-uploader" data-testid="profile-image-uploader">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {currentImageUrl ? (
              <img 
                src={currentImageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
                data-testid="profile-image"
              />
            ) : (
              <FontAwesomeIcon 
                icon={faUser} 
                className="text-gray-400 text-4xl"
                data-testid="default-icon"
              />
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                <div className="text-center">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-white text-xl" />
                  <div className="text-white text-xs mt-1">{uploadProgress}%</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            data-testid="file-input"
          />
          
          <Button
            variant="primary"
            size="sm"
            onClick={handleFileSelect}
            disabled={uploading}
            icon={faUpload}
            data-testid="upload-button"
          >
            {currentImageUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>
          
          {currentImageUrl && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteImage}
              disabled={uploading}
              icon={faTrash}
              data-testid="delete-button"
            >
              Remove Photo
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600" data-testid="error-message">
          {error}
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        Supported formats: JPG, PNG. Max size: 5MB
      </div>
    </div>
  );
};

export default ProfileImageUploader;
