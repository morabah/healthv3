/**
 * PatientDashboard Component
 * Dashboard for patient users showing appointments and allowing booking
 */
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, Timestamp, DocumentData } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseFirestore } from '@/lib/firebaseClient';
import { useAuth } from '@/context/AuthContext';
import { AppointmentStatus, UserType } from '@/types/enums';
import { Appointment } from '@/types/appointment';
import { DoctorProfile } from '@/types/doctor';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faSpinner, faExclamationTriangle, faUserMd, faCalendarPlus } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';

interface PatientDashboardProps {
  onBookAppointment?: () => void;
}

// Extended DoctorProfile with display fields for UI
interface DoctorProfileWithDisplay extends DoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  photoURL: string | null;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ 
  onBookAppointment 
}) => {
  const { user, userProfile } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<DoctorProfileWithDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch upcoming appointments and available doctors
  useEffect(() => {
    if (!user || !userProfile || userProfile.userType !== UserType.PATIENT) {
      return;
    }
    
    const fetchDashboardData = async () => {
      const perfTracker = trackPerformance('fetchPatientDashboard', 'PatientDashboard');
      
      try {
        setLoading(true);
        setError(null);
        
        logInfo({
          message: 'Fetching patient dashboard data',
          context: 'PatientDashboard',
          data: { userId: user.uid }
        });
        
        // Fetch upcoming appointments
        await fetchUpcomingAppointments();
        
        // Fetch available doctors
        await fetchAvailableDoctors();
        
        perfTracker.stop({ success: true });
      } catch (error: any) {
        logError({
          message: 'Error fetching dashboard data',
          context: 'PatientDashboard',
          data: { userId: user.uid, error }
        });
        
        setError('Failed to load dashboard data. Please try again later.');
        perfTracker.stop({ error: true });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, userProfile]);
  
  const fetchUpcomingAppointments = async () => {
    if (!user) return;
    
    try {
      const firestore = getFirebaseFirestore();
      const appointmentsRef = collection(firestore, 'appointments');
      
      // Get current date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Query for upcoming appointments
      const appointmentsQuery = query(
        appointmentsRef,
        where('patientId', '==', user.uid),
        where('appointmentDate', '>=', Timestamp.fromDate(today)),
        where('status', 'in', [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING]),
        orderBy('appointmentDate', 'asc')
      );
      
      const querySnapshot = await getDocs(appointmentsQuery);
      const appointments: Appointment[] = [];
      
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        } as Appointment);
      });
      
      setUpcomingAppointments(appointments);
      
      logInfo({
        message: 'Upcoming appointments fetched successfully',
        context: 'PatientDashboard',
        data: { userId: user.uid, count: appointments.length }
      });
    } catch (error) {
      throw error;
    }
  };
  
  const fetchAvailableDoctors = async () => {
    if (!user) return;
    
    try {
      const firestore = getFirebaseFirestore();
      const doctorsRef = collection(firestore, 'doctorProfiles');
      const userProfilesRef = collection(firestore, 'userProfiles');
      
      // Query for verified doctors
      const doctorsQuery = query(
        doctorsRef,
        where('verificationStatus', '==', 'VERIFIED')
      );
      
      const querySnapshot = await getDocs(doctorsQuery);
      const doctors: DoctorProfileWithDisplay[] = [];
      
      // Process doctor profiles and fetch corresponding user profiles
      for (const docSnapshot of querySnapshot.docs) {
        const doctorData = docSnapshot.data() as DoctorProfile;
        
        // Get the user profile for this doctor to get name and photo
        const userProfileQuery = query(
          userProfilesRef,
          where('id', '==', doctorData.userId)
        );
        
        const userProfileSnapshot = await getDocs(userProfileQuery);
        
        if (!userProfileSnapshot.empty) {
          const userProfileData = userProfileSnapshot.docs[0].data();
          
          doctors.push({
            ...doctorData,
            id: docSnapshot.id,
            firstName: userProfileData.firstName || '',
            lastName: userProfileData.lastName || '',
            specialization: doctorData.specialty || '',
            photoURL: userProfileData.photoURL || null
          });
        }
      }
      
      // Sort doctors by last name
      doctors.sort((a, b) => a.lastName.localeCompare(b.lastName));
      
      setAvailableDoctors(doctors);
      
      logInfo({
        message: 'Available doctors fetched successfully',
        context: 'PatientDashboard',
        data: { userId: user.uid, count: doctors.length }
      });
    } catch (error) {
      throw error;
    }
  };
  
  const handleCancelAppointment = async (appointmentId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      logInfo({
        message: 'Cancelling appointment',
        context: 'PatientDashboard',
        data: { userId: user.uid, appointmentId }
      });
      
      const functions = getFunctions();
      const cancelAppointment = httpsCallable(functions, 'cancelAppointment');
      
      await cancelAppointment({ appointmentId });
      
      // Refresh appointments after cancellation
      await fetchUpcomingAppointments();
      
      logInfo({
        message: 'Appointment cancelled successfully',
        context: 'PatientDashboard',
        data: { userId: user.uid, appointmentId }
      });
    } catch (error: any) {
      logError({
        message: 'Error cancelling appointment',
        context: 'PatientDashboard',
        data: { userId: user.uid, appointmentId, error }
      });
      
      setError('Failed to cancel appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle book appointment button click
  const handleBookAppointment = () => {
    if (onBookAppointment) {
      onBookAppointment();
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-8" data-testid="loading-dashboard">
        <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-2xl mb-2" />
        <p>Loading dashboard...</p>
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
  
  return (
    <div className="patient-dashboard" data-testid="patient-dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Appointments Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-blue-500" />
              Upcoming Appointments
            </h2>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleBookAppointment}
              icon={faCalendarPlus}
              data-testid="book-appointment-button"
            >
              Book New
            </Button>
          </div>
          
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-6 text-gray-500" data-testid="no-appointments">
              <p>No upcoming appointments</p>
              <p className="text-sm mt-2">Book an appointment with one of our doctors</p>
            </div>
          ) : (
            <div className="space-y-4" data-testid="appointments-list">
              {upcomingAppointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="border rounded-lg p-4 shadow-sm"
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
                      <p className="text-sm text-gray-600 mt-1">
                        Doctor: {appointment.doctorName}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                        appointment.status === AppointmentStatus.CONFIRMED ? 'bg-green-100 text-green-800' :
                        appointment.status === AppointmentStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                      
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        disabled={loading}
                        data-testid="cancel-button"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Available Doctors Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FontAwesomeIcon icon={faUserMd} className="mr-2 text-blue-500" />
            Available Doctors
          </h2>
          
          {availableDoctors.length === 0 ? (
            <div className="text-center py-6 text-gray-500" data-testid="no-doctors">
              <p>No doctors available at the moment</p>
              <p className="text-sm mt-2">Please check back later</p>
            </div>
          ) : (
            <div className="space-y-4" data-testid="doctors-list">
              {availableDoctors.map((doctor) => (
                <div 
                  key={doctor.id} 
                  className="border rounded-lg p-4 shadow-sm flex items-center"
                  data-testid="doctor-item"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    {doctor.photoURL ? (
                      <img 
                        src={doctor.photoURL} 
                        alt={`Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faUserMd} className="text-gray-400" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {doctor.specialization}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
