/**
 * Patient Dashboard Page
 * Main dashboard for patients to view and manage their appointments
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarCheck, 
  faFileMedical, 
  faPrescriptionBottleMedical, 
  faBell,
  faUser,
  faCalendarAlt,
  faVenusMars,
  faTint,
  faEnvelope,
  faPhone,
  faPen
} from '@fortawesome/free-solid-svg-icons';
import { UserType, AppointmentStatus } from '@/types/enums';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { getFirebaseFirestore } from '@/lib/firebaseClient';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';
import { Appointment } from '@/types/appointment';
import { PatientProfile } from '@/types/patient';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';

// Dashboard statistics card component
interface StatCardProps {
  title: string;
  count: number;
  icon: any;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, icon, color }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-t-4 ${color}`}>
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold mt-1">{count}</p>
      </div>
      <div className={`text-${color.replace('border-', '')} text-2xl`}>
        <FontAwesomeIcon icon={icon} />
      </div>
    </div>
  </div>
);

// Appointment card component
interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
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
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{appointment.doctorName || 'Doctor'}</h3>
          <p className="text-sm text-gray-500">{appointment.doctorSpecialty || 'Specialist'}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>
      <div className="mt-3 flex items-center text-sm text-gray-600">
        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
        <span>{formatDate(appointment.appointmentDate)}</span>
      </div>
      <div className="mt-1 text-sm text-gray-600">
        <span className="ml-6">{appointment.startTime} - {appointment.endTime}</span>
      </div>
    </div>
  );
};

export default function PatientDashboard() {
  // Protect this route - only authenticated patients can access
  const { user, userProfile, isLoading } = useProtectedRoute({
    requiredUserTypes: [UserType.PATIENT],
    redirectTo: '/auth/login'
  });
  
  // State for dashboard data
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    medicalRecords: 0,
    prescriptions: 0,
    notifications: 0
  });
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Fetch patient data and appointments
  useEffect(() => {
    if (!user || !userProfile || userProfile.userType !== UserType.PATIENT) {
      return;
    }
    
    const fetchDashboardData = async () => {
      const perfTracker = trackPerformance('fetchPatientDashboardData', 'PatientDashboard');
      setIsDataLoading(true);
      
      try {
        logInfo({
          message: 'Fetching patient dashboard data',
          context: 'PatientDashboard',
          data: { userId: user.uid }
        });
        
        const firestore = getFirebaseFirestore();
        
        // Fetch patient profile
        const patientDocRef = doc(firestore, 'patients', user.uid);
        const patientDocSnap = await getDoc(patientDocRef);
        
        if (patientDocSnap.exists()) {
          setPatientProfile(patientDocSnap.data() as PatientProfile);
        }
        
        // Fetch upcoming appointments
        const today = new Date();
        const appointmentsQuery = query(
          collection(firestore, 'appointments'),
          where('patientId', '==', user.uid),
          where('status', 'in', [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING]),
          where('appointmentDate', '>=', today),
          orderBy('appointmentDate', 'asc'),
          limit(5)
        );
        
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointments: Appointment[] = [];
        
        appointmentsSnapshot.forEach((doc) => {
          appointments.push({ id: doc.id, ...doc.data() } as Appointment);
        });
        
        setUpcomingAppointments(appointments);
        
        // Set stats (using real upcoming appointments count and mock data for others)
        setStats({
          upcomingAppointments: appointments.length,
          medicalRecords: 3, // Mock data
          prescriptions: 2, // Mock data
          notifications: 1 // Mock data
        });
        
        logInfo({
          message: 'Patient dashboard data fetched successfully',
          context: 'PatientDashboard',
          data: { 
            userId: user.uid,
            appointmentsCount: appointments.length
          }
        });
      } catch (error) {
        logError({
          message: 'Error fetching patient dashboard data',
          context: 'PatientDashboard',
          data: { userId: user.uid, error }
        });
      } finally {
        setIsDataLoading(false);
        perfTracker.stop();
      }
    };
    
    fetchDashboardData();
  }, [user, userProfile]);
  
  // Log page visit if authorized
  React.useEffect(() => {
    if (user && userProfile?.userType === UserType.PATIENT) {
      logInfo({
        message: 'Patient dashboard visited',
        context: 'PatientDashboard',
        data: { userId: user.uid }
      });
    }
  }, [user, userProfile]);

  // Show loading state
  if (isLoading || isDataLoading) {
    return (
      <Layout title="Patient Dashboard - Health Appointment System">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Patient Dashboard - Health Appointment System">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {userProfile?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your health information and upcoming appointments.
          </p>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Upcoming Appointments" 
            count={stats.upcomingAppointments} 
            icon={faCalendarCheck} 
            color="border-blue-500" 
          />
          <StatCard 
            title="Medical Records" 
            count={stats.medicalRecords} 
            icon={faFileMedical} 
            color="border-green-500" 
          />
          <StatCard 
            title="Prescriptions" 
            count={stats.prescriptions} 
            icon={faPrescriptionBottleMedical} 
            color="border-purple-500" 
          />
          <StatCard 
            title="Notifications" 
            count={stats.notifications} 
            icon={faBell} 
            color="border-yellow-500" 
          />
        </div>
        
        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upcoming Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
                <Link href="/patient/appointments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </Link>
              </div>
              
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-300 text-5xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No Upcoming Appointments</h3>
                  <p className="text-gray-500 mt-1">You don't have any upcoming appointments scheduled.</p>
                  <Link href="/patient/appointments/new" passHref>
                    <Button variant="primary" className="mt-4">
                      Book an Appointment
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Profile Information */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
                <Link href="/patient/profile" className="text-blue-600 hover:text-blue-800">
                  <FontAwesomeIcon icon={faPen} className="mr-1" />
                  <span className="text-sm font-medium">Edit</span>
                </Link>
              </div>
              
              <div className="space-y-4">
                {/* Personal Information */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Personal Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faUser} className="text-gray-400 mt-1 mr-3 w-4" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{userProfile?.firstName} {userProfile?.lastName}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 mt-1 mr-3 w-4" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{userProfile?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faPhone} className="text-gray-400 mt-1 mr-3 w-4" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{userProfile?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Medical Information */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Medical Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mt-1 mr-3 w-4" />
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">
                          {patientProfile?.dateOfBirth 
                            ? new Date(patientProfile.dateOfBirth.seconds * 1000).toLocaleDateString() 
                            : 'Not provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faVenusMars} className="text-gray-400 mt-1 mr-3 w-4" />
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium">{patientProfile?.gender || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faTint} className="text-gray-400 mt-1 mr-3 w-4" />
                      <div>
                        <p className="text-sm text-gray-500">Blood Type</p>
                        <p className="font-medium">{patientProfile?.bloodType || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
