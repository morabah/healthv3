/**
 * AppointmentList Component
 * Displays a list of appointments for the authenticated user
 */
import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebaseClient';
import { useAuth } from '@/context/AuthContext';
import { AppointmentStatus, UserType } from '@/types/enums';
import { Appointment } from '@/types/appointment';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface AppointmentListProps {
  status?: AppointmentStatus;
  limit?: number;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ 
  status,
  limit = 10
}) => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Skip if still loading auth or no user
    if (authLoading || !user || !userProfile) {
      return;
    }
    
    const fetchAppointments = async () => {
      const perfTracker = trackPerformance('fetchAppointments', 'AppointmentList');
      
      try {
        setLoading(true);
        setError(null);
        
        logInfo({
          message: 'Fetching appointments',
          context: 'AppointmentList',
          data: { userId: user.uid, status }
        });
        
        const firestore = getFirebaseFirestore();
        const appointmentsRef = collection(firestore, 'appointments');
        
        // Build query based on user role
        let appointmentsQuery = query(appointmentsRef);
        
        if (userProfile.userType === UserType.PATIENT) {
          appointmentsQuery = query(
            appointmentsRef, 
            where('patientId', '==', user.uid)
          );
        } else if (userProfile.userType === UserType.DOCTOR) {
          appointmentsQuery = query(
            appointmentsRef, 
            where('doctorId', '==', user.uid)
          );
        }
        
        // Add status filter if provided
        if (status) {
          appointmentsQuery = query(
            appointmentsQuery,
            where('status', '==', status)
          );
        }
        
        // Order by appointment date
        appointmentsQuery = query(
          appointmentsQuery,
          orderBy('appointmentDate', 'desc')
        );
        
        const querySnapshot = await getDocs(appointmentsQuery);
        const appointmentsList: Appointment[] = [];
        
        querySnapshot.forEach((doc) => {
          appointmentsList.push({
            id: doc.id,
            ...doc.data()
          } as Appointment);
        });
        
        // Limit the number of appointments if needed
        const limitedAppointments = appointmentsList.slice(0, limit);
        
        setAppointments(limitedAppointments);
        
        logInfo({
          message: 'Appointments fetched successfully',
          context: 'AppointmentList',
          data: { 
            userId: user.uid, 
            count: limitedAppointments.length 
          }
        });
        
        perfTracker.stop({ count: limitedAppointments.length });
      } catch (error: any) {
        logError({
          message: 'Error fetching appointments',
          context: 'AppointmentList',
          data: { error }
        });
        
        setError('Failed to load appointments. Please try again later.');
        perfTracker.stop({ error: true });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [user, userProfile, authLoading, status, limit]);
  
  if (authLoading) {
    return (
      <div className="text-center py-8" data-testid="loading-auth">
        <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-2xl mb-2" />
        <p>Loading user information...</p>
      </div>
    );
  }
  
  if (!user || !userProfile) {
    return (
      <div className="text-center py-8" data-testid="no-auth">
        <p>Please log in to view your appointments</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="text-center py-8" data-testid="loading-appointments">
        <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-2xl mb-2" />
        <p>Loading appointments...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-red-500" data-testid="error-message">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl mb-2" />
        <p>{error}</p>
      </div>
    );
  }
  
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8" data-testid="no-appointments">
        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-2xl mb-2" />
        <p>No appointments found</p>
      </div>
    );
  }
  
  return (
    <div className="appointments-list" data-testid="appointments-list">
      <h2 className="text-xl font-semibold mb-4">
        Your Appointments {status && `(${status})`}
      </h2>
      
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div 
            key={appointment.id} 
            className="appointment-card border rounded-lg p-4 shadow-sm"
            data-testid="appointment-item"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">
                  {appointment.reason || 'Appointment'}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(appointment.appointmentDate.seconds * 1000).toLocaleDateString()}
                  {' '}at {appointment.startTime} - {appointment.endTime}
                </p>
              </div>
              <div className="appointment-status">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  appointment.status === AppointmentStatus.CONFIRMED ? 'bg-green-100 text-green-800' :
                  appointment.status === AppointmentStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                  appointment.status === AppointmentStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                  appointment.status === AppointmentStatus.COMPLETED ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentList;
