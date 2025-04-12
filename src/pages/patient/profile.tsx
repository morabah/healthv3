/**
 * Patient Profile Page
 * Allows patients to view and edit their profile information
 */

import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faCalendarAlt, 
  faVenusMars, 
  faTint, 
  faNotesMedical,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import { UserType } from '@/types/enums';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { getFirebaseFirestore } from '@/lib/firebaseClient';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';
import { PatientProfile } from '@/types/patient';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

// Blood type options
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Gender options
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function PatientProfilePage() {
  // Protect this route - only authenticated patients can access
  const { user, userProfile, isLoading } = useProtectedRoute({
    requiredUserTypes: [UserType.PATIENT],
    redirectTo: '/auth/login'
  });
  
  // Form state
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    medicalHistory: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Fetch patient profile data
  useEffect(() => {
    if (!user || !userProfile || userProfile.userType !== UserType.PATIENT) {
      return;
    }
    
    const fetchPatientProfile = async () => {
      const perfTracker = trackPerformance('fetchPatientProfile', 'PatientProfilePage');
      setIsDataLoading(true);
      
      try {
        logInfo({
          message: 'Fetching patient profile data',
          context: 'PatientProfilePage',
          data: { userId: user.uid }
        });
        
        const firestore = getFirebaseFirestore();
        
        // Fetch patient profile
        const patientDocRef = doc(firestore, 'patients', user.uid);
        const patientDocSnap = await getDoc(patientDocRef);
        
        if (patientDocSnap.exists()) {
          const patientData = patientDocSnap.data() as PatientProfile;
          setPatientProfile(patientData);
          
          // Format date for input field
          let dateOfBirthStr = '';
          if (patientData.dateOfBirth) {
            const date = patientData.dateOfBirth.toDate();
            dateOfBirthStr = date.toISOString().split('T')[0];
          }
          
          // Initialize form data
          setFormData({
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            email: userProfile.email || '',
            phone: userProfile.phone || '',
            dateOfBirth: dateOfBirthStr,
            gender: patientData.gender || '',
            bloodType: patientData.bloodType || '',
            medicalHistory: patientData.medicalHistory || ''
          });
        }
        
        logInfo({
          message: 'Patient profile data fetched successfully',
          context: 'PatientProfilePage',
          data: { userId: user.uid }
        });
      } catch (error) {
        logError({
          message: 'Error fetching patient profile data',
          context: 'PatientProfilePage',
          data: { userId: user.uid, error }
        });
      } finally {
        setIsDataLoading(false);
        perfTracker.stop();
      }
    };
    
    fetchPatientProfile();
  }, [user, userProfile]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const perfTracker = trackPerformance('updatePatientProfile', 'PatientProfilePage');
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      logInfo({
        message: 'Updating patient profile',
        context: 'PatientProfilePage',
        data: { userId: user!.uid }
      });
      
      const firestore = getFirebaseFirestore();
      
      // Update patient profile
      const patientDocRef = doc(firestore, 'patients', user!.uid);
      
      // Convert date string to Timestamp
      let dateOfBirthTimestamp = null;
      if (formData.dateOfBirth) {
        dateOfBirthTimestamp = Timestamp.fromDate(new Date(formData.dateOfBirth));
      }
      
      await updateDoc(patientDocRef, {
        gender: formData.gender || null,
        bloodType: formData.bloodType || null,
        dateOfBirth: dateOfBirthTimestamp,
        medicalHistory: formData.medicalHistory || null
      });
      
      // Update user profile if phone number changed
      if (formData.phone !== userProfile?.phone) {
        const userDocRef = doc(firestore, 'users', user!.uid);
        await updateDoc(userDocRef, {
          phone: formData.phone || null
        });
      }
      
      logInfo({
        message: 'Patient profile updated successfully',
        context: 'PatientProfilePage',
        data: { userId: user!.uid }
      });
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      logError({
        message: 'Error updating patient profile',
        context: 'PatientProfilePage',
        data: { userId: user!.uid, error }
      });
      
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
      perfTracker.stop();
    }
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };
  
  // Show loading state
  if (isLoading || isDataLoading) {
    return (
      <Layout title="My Profile - Health Appointment System">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Profile - Health Appointment System">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-1">
            View and manage your personal and medical information
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <p className="text-green-700">{success}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
            {!isEditing && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={toggleEditMode}
              >
                <FontAwesomeIcon icon={faPen} className="mr-1" />
                Edit Profile
              </Button>
            )}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information Section */}
              <div className="md:col-span-2">
                <h3 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Personal Information</h3>
              </div>
              
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={true} // Name can only be changed by admin
                  required
                />
              </div>
              
              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={true} // Name can only be changed by admin
                  required
                />
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-400" />
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true} // Email can only be changed by admin
                  required
                />
              </div>
              
              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-400" />
                  Phone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing || isSubmitting}
                />
              </div>
              
              {/* Medical Information Section */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Medical Information</h3>
              </div>
              
              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                  Date of Birth
                </label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={!isEditing || isSubmitting}
                />
              </div>
              
              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faVenusMars} className="mr-2 text-gray-400" />
                  Gender
                </label>
                <Select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditing || isSubmitting}
                >
                  <option value="">Select gender</option>
                  {GENDERS.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </Select>
              </div>
              
              {/* Blood Type */}
              <div>
                <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faTint} className="mr-2 text-gray-400" />
                  Blood Type
                </label>
                <Select
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  disabled={!isEditing || isSubmitting}
                >
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </div>
              
              {/* Medical History */}
              <div className="md:col-span-2">
                <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faNotesMedical} className="mr-2 text-gray-400" />
                  Medical History
                </label>
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter any relevant medical history, allergies, or conditions"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  disabled={!isEditing || isSubmitting}
                />
              </div>
            </div>
            
            {isEditing && (
              <div className="flex justify-end space-x-3 mt-8">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={toggleEditMode}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={faSave}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}
