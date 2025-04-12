/**
 * New Appointment Booking Page
 * Allows patients to book new appointments with doctors
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faStethoscope, faCalendarAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import { UserType, AppointmentStatus, VerificationStatus } from '@/types/enums';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { getFirebaseFirestore } from '@/lib/firebaseClient';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';
import { DoctorProfile } from '@/types/doctor';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

// Available time slots
const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

// Calculate end time (30 min appointments)
const calculateEndTime = (startTime: string): string => {
  const [time, period] = startTime.split(' ');
  const [hour, minute] = time.split(':').map(Number);
  
  let newHour = hour;
  let newMinute = minute + 30;
  let newPeriod = period;
  
  if (newMinute >= 60) {
    newHour += 1;
    newMinute -= 60;
  }
  
  if (newHour === 12 && period === 'AM') {
    newPeriod = 'PM';
  } else if (newHour > 12) {
    newHour -= 12;
    newPeriod = 'PM';
  }
  
  return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')} ${newPeriod}`;
};

export default function NewAppointment() {
  // Protect this route - only authenticated patients can access
  const { user, userProfile, isLoading } = useProtectedRoute({
    requiredUserTypes: [UserType.PATIENT],
    redirectTo: '/auth/login'
  });
  
  const router = useRouter();
  
  // Form state
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Fetch available doctors
  useEffect(() => {
    if (!user || !userProfile || userProfile.userType !== UserType.PATIENT) {
      return;
    }
    
    const fetchDoctors = async () => {
      const perfTracker = trackPerformance('fetchAvailableDoctors', 'NewAppointment');
      setIsDataLoading(true);
      
      try {
        logInfo({
          message: 'Fetching available doctors',
          context: 'NewAppointment',
          data: { userId: user.uid }
        });
        
        const firestore = getFirebaseFirestore();
        
        // Query for verified doctors only
        const doctorsQuery = query(
          collection(firestore, 'doctors'),
          where('verificationStatus', '==', VerificationStatus.VERIFIED)
        );
        
        const doctorsSnapshot = await getDocs(doctorsQuery);
        const doctorsList: DoctorProfile[] = [];
        
        doctorsSnapshot.forEach((doc) => {
          doctorsList.push({ id: doc.id, ...doc.data() } as DoctorProfile);
        });
        
        setDoctors(doctorsList);
        
        logInfo({
          message: 'Available doctors fetched successfully',
          context: 'NewAppointment',
          data: { count: doctorsList.length }
        });
      } catch (error) {
        logError({
          message: 'Error fetching available doctors',
          context: 'NewAppointment',
          data: { error }
        });
      } finally {
        setIsDataLoading(false);
        perfTracker.stop();
      }
    };
    
    fetchDoctors();
  }, [user, userProfile]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    const perfTracker = trackPerformance('createAppointment', 'NewAppointment');
    setIsSubmitting(true);
    setError('');
    
    try {
      logInfo({
        message: 'Creating new appointment',
        context: 'NewAppointment',
        data: { 
          userId: user!.uid,
          doctorId: selectedDoctor,
          date: selectedDate,
          time: selectedTime
        }
      });
      
      const firestore = getFirebaseFirestore();
      
      // Get selected doctor details
      const selectedDoctorData = doctors.find(doctor => doctor.id === selectedDoctor);
      
      if (!selectedDoctorData) {
        throw new Error('Selected doctor not found');
      }
      
      // Calculate end time (30 min appointments)
      const endTime = calculateEndTime(selectedTime);
      
      // Create appointment document
      const appointmentData = {
        patientId: user!.uid,
        patientName: `${userProfile!.firstName} ${userProfile!.lastName}`,
        doctorId: selectedDoctor,
        doctorName: `Dr. ${selectedDoctorData.firstName} ${selectedDoctorData.lastName}`,
        doctorSpecialty: selectedDoctorData.specialty || 'General Practitioner',
        appointmentDate: Timestamp.fromDate(new Date(selectedDate)),
        startTime: selectedTime,
        endTime: endTime,
        reason: reason,
        status: AppointmentStatus.PENDING,
        createdAt: Timestamp.now()
      };
      
      const appointmentRef = await addDoc(collection(firestore, 'appointments'), appointmentData);
      
      logInfo({
        message: 'Appointment created successfully',
        context: 'NewAppointment',
        data: { 
          appointmentId: appointmentRef.id,
          userId: user!.uid,
          doctorId: selectedDoctor
        }
      });
      
      // Redirect to appointments page
      router.push('/patient/appointments');
    } catch (error) {
      logError({
        message: 'Error creating appointment',
        context: 'NewAppointment',
        data: { error }
      });
      
      setError('Failed to create appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
      perfTracker.stop();
    }
  };
  
  // Calculate minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  
  // Show loading state
  if (isLoading || isDataLoading) {
    return (
      <Layout title="Book Appointment - Health Appointment System">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Book Appointment - Health Appointment System">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Book an Appointment</h1>
          <p className="text-gray-600 mt-1">
            Schedule a new appointment with one of our healthcare providers
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            <div className="space-y-6">
              {/* Doctor Selection */}
              <div>
                <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faStethoscope} className="mr-2" />
                  Select Doctor
                </label>
                <Select
                  id="doctor"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialty || 'General Practitioner'}
                    </option>
                  ))}
                </Select>
              </div>
              
              {/* Date Selection */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  Appointment Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              {/* Time Selection */}
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faClock} className="mr-2" />
                  Appointment Time
                </label>
                <Select
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Select a time</option>
                  {TIME_SLOTS.map((time) => (
                    <option key={time} value={time}>
                      {time} - {calculateEndTime(time)}
                    </option>
                  ))}
                </Select>
              </div>
              
              {/* Reason for Visit */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit
                </label>
                <textarea
                  id="reason"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please describe your symptoms or reason for the appointment"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  icon={faCalendarPlus}
                >
                  {isSubmitting ? 'Booking...' : 'Book Appointment'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
