/**
 * DoctorVerification Component
 * Admin component for verifying doctor profiles
 */
import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseFirestore } from '@/lib/firebaseClient';
import { VerificationStatus } from '@/types/enums';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';

interface DoctorVerificationProps {
  doctorId: string;
  currentStatus: VerificationStatus;
  doctorName: string;
  onVerificationComplete?: (status: VerificationStatus) => void;
}

const DoctorVerification: React.FC<DoctorVerificationProps> = ({
  doctorId,
  currentStatus,
  doctorName,
  onVerificationComplete
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  
  const handleVerification = async (status: VerificationStatus) => {
    setLoading(true);
    setError(null);
    
    const perfTracker = trackPerformance('verifyDoctor', 'admin');
    
    try {
      logInfo({
        message: 'Doctor verification process started',
        context: 'DoctorVerification',
        data: { doctorId, status }
      });
      
      const functions = getFunctions();
      const adminVerifyDoctor = httpsCallable(functions, 'adminVerifyDoctor');
      
      const result = await adminVerifyDoctor({
        doctorId,
        status,
        notes: notes.trim() || undefined
      });
      
      logInfo({
        message: 'Doctor verification completed successfully',
        context: 'DoctorVerification',
        data: { doctorId, status, result }
      });
      
      // Call the completion callback if provided
      if (onVerificationComplete) {
        onVerificationComplete(status);
      }
      
      perfTracker.stop({ status });
    } catch (error: any) {
      logError({
        message: 'Doctor verification failed',
        context: 'DoctorVerification',
        data: { doctorId, status, error }
      });
      
      setError(error.message || 'Failed to update verification status');
      perfTracker.stop({ error: true });
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = () => handleVerification(VerificationStatus.VERIFIED);
  const handleReject = () => handleVerification(VerificationStatus.REJECTED);
  
  return (
    <div className="doctor-verification p-4 border rounded-lg" data-testid="doctor-verification">
      <h3 className="text-lg font-medium mb-2">
        Verify Doctor: {doctorName}
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Current Status: 
          <span className={`ml-2 font-medium ${
            currentStatus === VerificationStatus.VERIFIED ? 'text-green-600' :
            currentStatus === VerificationStatus.REJECTED ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {currentStatus}
          </span>
        </p>
      </div>
      
      <div className="mb-4">
        <label htmlFor="verification-notes" className="block mb-1 text-sm font-medium">
          Verification Notes
        </label>
        <textarea
          id="verification-notes"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Add notes about the verification decision..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={loading}
          data-testid="verification-notes"
        />
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded" data-testid="error-message">
          {error}
        </div>
      )}
      
      <div className="flex space-x-3">
        <Button
          variant="success"
          onClick={handleApprove}
          disabled={loading || currentStatus === VerificationStatus.VERIFIED}
          loading={loading && currentStatus !== VerificationStatus.VERIFIED}
          icon={faCheck}
          data-testid="approve-button"
        >
          Approve
        </Button>
        
        <Button
          variant="danger"
          onClick={handleReject}
          disabled={loading || currentStatus === VerificationStatus.REJECTED}
          loading={loading && currentStatus !== VerificationStatus.REJECTED}
          icon={faTimes}
          data-testid="reject-button"
        >
          Reject
        </Button>
      </div>
    </div>
  );
};

export default DoctorVerification;
