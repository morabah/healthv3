/**
 * Cancel Appointment Modal Component
 * Modal for patients to cancel their appointments with a reason
 */

import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';
import * as Dialog from '@radix-ui/react-dialog';
import { AppointmentStatus } from '@/types/enums';
import { getFirebaseFirestore } from '@/lib/firebaseClient';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';
import { Appointment } from '@/types/appointment';
import Button from '@/components/ui/Button';

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
}

const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Format date for display
  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Handle cancel appointment submission
  const handleCancelAppointment = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }
    
    const perfTracker = trackPerformance('cancelAppointment', 'CancelAppointmentModal');
    setIsSubmitting(true);
    setError('');
    
    try {
      logInfo({
        message: 'Cancelling appointment',
        context: 'CancelAppointmentModal',
        data: { appointmentId: appointment.id, reason }
      });
      
      const firestore = getFirebaseFirestore();
      const appointmentRef = doc(firestore, 'appointments', appointment.id);
      
      await updateDoc(appointmentRef, {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: reason,
        cancelledBy: 'patient',
        cancelledAt: new Date()
      });
      
      logInfo({
        message: 'Appointment cancelled successfully',
        context: 'CancelAppointmentModal',
        data: { appointmentId: appointment.id }
      });
      
      // Close modal and refresh page to show updated data
      onClose();
      window.location.reload();
    } catch (error) {
      logError({
        message: 'Error cancelling appointment',
        context: 'CancelAppointmentModal',
        data: { appointmentId: appointment.id, error }
      });
      
      setError('Failed to cancel appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
      perfTracker.stop();
    }
  };
  
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-800">
              Cancel Appointment
            </Dialog.Title>
            <Dialog.Close asChild>
              <button 
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </Dialog.Close>
          </div>
          
          <div className="mb-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-yellow-700">
                    Are you sure you want to cancel this appointment? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Appointment Details:</h3>
              <p className="text-sm text-gray-600">
                <strong>Doctor:</strong> {appointment.doctorName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Date:</strong> {formatDate(appointment.appointmentDate)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Time:</strong> {appointment.startTime} - {appointment.endTime}
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="cancellation-reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Cancellation*
              </label>
              <textarea
                id="cancellation-reason"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please provide a reason for cancelling this appointment"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelAppointment}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Cancelling...' : 'Cancel Appointment'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CancelAppointmentModal;
