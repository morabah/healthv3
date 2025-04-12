/**
 * Patient Appointments Page
 * Displays all patient appointments with tabs for different statuses
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faClockRotateLeft, 
  faBan,
  faUser,
  faStethoscope,
  faCalendarCheck,
  faEye,
  faTimes,
  faRedo
} from '@fortawesome/free-solid-svg-icons';
import * as Tabs from '@radix-ui/react-tabs';
import { UserType, AppointmentStatus } from '@/types/enums';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { getFirebaseFirestore } from '@/lib/firebaseClient';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';
import { Appointment } from '@/types/appointment';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import CancelAppointmentModal from '@/components/patient/CancelAppointmentModal';

// Appointment card component
interface AppointmentCardProps {
  appointment: Appointment;
  onViewDetails: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
  showCancelButton?: boolean;
  showRescheduleButton?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onViewDetails, 
  onCancel, 
  onReschedule,
  showCancelButton = false,
  showRescheduleButton = false
}) => {
  // Format date and time
  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case AppointmentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case AppointmentStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case AppointmentStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{appointment.doctorName || 'Doctor'}</h3>
          <p className="text-sm text-gray-500">{appointment.doctorSpecialty || 'Specialist'}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
          <span>{formatDate(appointment.appointmentDate)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FontAwesomeIcon icon={faCalendarCheck} className="mr-2 text-gray-400" />
          <span>{appointment.startTime} - {appointment.endTime}</span>
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => onViewDetails(appointment)}
        >
          <FontAwesomeIcon icon={faEye} className="mr-1" />
          View Details
        </Button>
        
        <div className="space-x-2">
          {showCancelButton && (
            <Button 
              variant="danger" 
              size="sm" 
              onClick={() => onCancel(appointment)}
            >
              <FontAwesomeIcon icon={faTimes} className="mr-1" />
              Cancel
            </Button>
          )}
          
          {showRescheduleButton && (
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => onReschedule(appointment)}
            >
              <FontAwesomeIcon icon={faRedo} className="mr-1" />
              Reschedule
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Empty state component
interface EmptyStateProps {
  message: string;
  icon: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon }) => (
  <div className="text-center py-12">
    <FontAwesomeIcon icon={icon} className="text-gray-300 text-5xl mb-4" />
    <h3 className="text-lg font-medium text-gray-700">{message}</h3>
    <p className="text-gray-500 mt-1">No appointments found in this category.</p>
  </div>
);

export default function PatientAppointments() {
  // Protect this route - only authenticated patients can access
  const { user, userProfile, isLoading } = useProtectedRoute({
    requiredUserTypes: [UserType.PATIENT],
    redirectTo: '/auth/login'
  });
  
  // State for appointments data
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [cancelledAppointments, setCancelledAppointments] = useState<Appointment[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // State for modals
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Fetch appointments data
  useEffect(() => {
    if (!user || !userProfile || userProfile.userType !== UserType.PATIENT) {
      return;
    }
    
    const fetchAppointments = async () => {
      const perfTracker = trackPerformance('fetchPatientAppointments', 'PatientAppointments');
      setIsDataLoading(true);
      
      try {
        logInfo({
          message: 'Fetching patient appointments',
          context: 'PatientAppointments',
          data: { userId: user.uid }
        });
        
        const firestore = getFirebaseFirestore();
        const today = new Date();
        
        // Fetch upcoming appointments (CONFIRMED or PENDING with date >= today)
        const upcomingQuery = query(
          collection(firestore, 'appointments'),
          where('patientId', '==', user.uid),
          where('status', 'in', [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING]),
          where('appointmentDate', '>=', today),
          orderBy('appointmentDate', 'asc')
        );
        
        // Fetch past appointments (COMPLETED with date < today)
        const pastQuery = query(
          collection(firestore, 'appointments'),
          where('patientId', '==', user.uid),
          where('status', '==', AppointmentStatus.COMPLETED),
          orderBy('appointmentDate', 'desc')
        );
        
        // Fetch cancelled appointments
        const cancelledQuery = query(
          collection(firestore, 'appointments'),
          where('patientId', '==', user.uid),
          where('status', '==', AppointmentStatus.CANCELLED),
          orderBy('appointmentDate', 'desc')
        );
        
        // Execute all queries in parallel
        const [upcomingSnapshot, pastSnapshot, cancelledSnapshot] = await Promise.all([
          getDocs(upcomingQuery),
          getDocs(pastQuery),
          getDocs(cancelledQuery)
        ]);
        
        // Process results
        const upcoming: Appointment[] = [];
        const past: Appointment[] = [];
        const cancelled: Appointment[] = [];
        
        upcomingSnapshot.forEach((doc) => {
          upcoming.push({ id: doc.id, ...doc.data() } as Appointment);
        });
        
        pastSnapshot.forEach((doc) => {
          past.push({ id: doc.id, ...doc.data() } as Appointment);
        });
        
        cancelledSnapshot.forEach((doc) => {
          cancelled.push({ id: doc.id, ...doc.data() } as Appointment);
        });
        
        setUpcomingAppointments(upcoming);
        setPastAppointments(past);
        setCancelledAppointments(cancelled);
        
        logInfo({
          message: 'Patient appointments fetched successfully',
          context: 'PatientAppointments',
          data: { 
            userId: user.uid,
            upcomingCount: upcoming.length,
            pastCount: past.length,
            cancelledCount: cancelled.length
          }
        });
      } catch (error) {
        logError({
          message: 'Error fetching patient appointments',
          context: 'PatientAppointments',
          data: { userId: user.uid, error }
        });
      } finally {
        setIsDataLoading(false);
        perfTracker.stop();
      }
    };
    
    fetchAppointments();
  }, [user, userProfile]);
  
  // Log page visit
  useEffect(() => {
    if (user && userProfile?.userType === UserType.PATIENT) {
      logInfo({
        message: 'Patient appointments page visited',
        context: 'PatientAppointments',
        data: { userId: user.uid }
      });
    }
  }, [user, userProfile]);
  
  // Handle view details
  const handleViewDetails = (appointment: Appointment) => {
    // For now, just log the action
    logInfo({
      message: 'View appointment details clicked',
      context: 'PatientAppointments',
      data: { appointmentId: appointment.id }
    });
    
    // In a real implementation, this would open a modal with appointment details
    alert(`Viewing details for appointment on ${appointment.appointmentDate.toDate().toLocaleDateString()}`);
  };
  
  // Handle cancel appointment
  const handleCancelAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };
  
  // Handle reschedule appointment
  const handleRescheduleAppointment = (appointment: Appointment) => {
    // For now, just log the action
    logInfo({
      message: 'Reschedule appointment clicked',
      context: 'PatientAppointments',
      data: { appointmentId: appointment.id }
    });
    
    // In a real implementation, this would navigate to a reschedule page
    alert(`Reschedule functionality not implemented yet for appointment on ${appointment.appointmentDate.toDate().toLocaleDateString()}`);
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    logInfo({
      message: 'Appointment tab changed',
      context: 'PatientAppointments',
      data: { tab: value }
    });
  };
  
  // Show loading state
  if (isLoading || isDataLoading) {
    return (
      <Layout title="My Appointments - Health Appointment System">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading appointments...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Appointments - Health Appointment System">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
          <p className="text-gray-600 mt-1">
            View and manage all your healthcare appointments
          </p>
        </div>
        
        <Tabs.Root 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <Tabs.List className="flex border-b border-gray-200 mb-8">
            <Tabs.Trigger 
              value="upcoming" 
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'upcoming' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
              Upcoming ({upcomingAppointments.length})
            </Tabs.Trigger>
            
            <Tabs.Trigger 
              value="past" 
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'past' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faClockRotateLeft} className="mr-2" />
              Past ({pastAppointments.length})
            </Tabs.Trigger>
            
            <Tabs.Trigger 
              value="cancelled" 
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'cancelled' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faBan} className="mr-2" />
              Cancelled ({cancelledAppointments.length})
            </Tabs.Trigger>
          </Tabs.List>
          
          <Tabs.Content value="upcoming" className="focus:outline-none">
            {upcomingAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id}
                    appointment={appointment}
                    onViewDetails={handleViewDetails}
                    onCancel={handleCancelAppointment}
                    onReschedule={handleRescheduleAppointment}
                    showCancelButton={true}
                    showRescheduleButton={true}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                message="No Upcoming Appointments" 
                icon={faCalendarAlt} 
              />
            )}
          </Tabs.Content>
          
          <Tabs.Content value="past" className="focus:outline-none">
            {pastAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id}
                    appointment={appointment}
                    onViewDetails={handleViewDetails}
                    onCancel={handleCancelAppointment}
                    onReschedule={handleRescheduleAppointment}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                message="No Past Appointments" 
                icon={faClockRotateLeft} 
              />
            )}
          </Tabs.Content>
          
          <Tabs.Content value="cancelled" className="focus:outline-none">
            {cancelledAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cancelledAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id}
                    appointment={appointment}
                    onViewDetails={handleViewDetails}
                    onCancel={handleCancelAppointment}
                    onReschedule={handleRescheduleAppointment}
                    showRescheduleButton={true}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                message="No Cancelled Appointments" 
                icon={faBan} 
              />
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>
      
      {/* Cancel Appointment Modal */}
      {selectedAppointment && (
        <CancelAppointmentModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          appointment={selectedAppointment}
        />
      )}
    </Layout>
  );
}
