/**
 * Find Doctors Page
 * Allows patients to search for and view doctor profiles
 */

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faStethoscope, 
  faMapMarkerAlt, 
  faStar,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import { UserType, VerificationStatus } from '@/types/enums';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { getFirebaseFirestore } from '@/lib/firebaseClient';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';
import { DoctorProfile } from '@/types/doctor';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

// Doctor card component
interface DoctorCardProps {
  doctor: DoctorProfile;
  onViewProfile: (doctorId: string) => void;
  onBookAppointment: (doctorId: string) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onViewProfile, onBookAppointment }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
      <div className="flex items-start">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
          {doctor.profileImageUrl ? (
            <img 
              src={doctor.profileImageUrl} 
              alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <FontAwesomeIcon icon={faStethoscope} className="text-gray-400 text-xl" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-lg">Dr. {doctor.firstName} {doctor.lastName}</h3>
          <p className="text-sm text-gray-500">{doctor.specialty || 'General Practitioner'}</p>
          
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-gray-400" />
            <span>{doctor.location || 'Location not specified'}</span>
          </div>
          
          <div className="mt-1 flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FontAwesomeIcon 
                  key={i} 
                  icon={faStar} 
                  className={i < (doctor.rating || 0) ? 'text-yellow-400' : 'text-gray-300'} 
                />
              ))}
            </div>
            <span className="ml-1 text-sm text-gray-600">
              ({doctor.reviewCount || 0} reviews)
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => onViewProfile(doctor.id || '')}
        >
          View Profile
        </Button>
        
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => onBookAppointment(doctor.id || '')}
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );
};

// Specialties for filter
const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Practice',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Urology'
];

export default function FindDoctorsPage() {
  // Protect this route - only authenticated patients can access
  const { user, userProfile, isLoading } = useProtectedRoute({
    requiredUserTypes: [UserType.PATIENT],
    redirectTo: '/auth/login'
  });
  
  // State for doctors data
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorProfile[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  
  // Fetch doctors data
  useEffect(() => {
    if (!user || !userProfile || userProfile.userType !== UserType.PATIENT) {
      return;
    }
    
    const fetchDoctors = async () => {
      const perfTracker = trackPerformance('fetchDoctors', 'FindDoctorsPage');
      setIsDataLoading(true);
      
      try {
        logInfo({
          message: 'Fetching doctors data',
          context: 'FindDoctorsPage',
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
          // Create a complete doctor profile with required fields and add mock data
          const doctorData = doc.data();
          doctorsList.push({
            id: doc.id,
            userId: doctorData.userId || '',
            specialty: doctorData.specialty || '',
            licenseNumber: doctorData.licenseNumber || '',
            yearsOfExperience: doctorData.yearsOfExperience || 0,
            education: doctorData.education || null,
            bio: doctorData.bio || null,
            verificationStatus: doctorData.verificationStatus || VerificationStatus.PENDING,
            verificationNotes: doctorData.verificationNotes || null,
            location: doctorData.location || null,
            languages: doctorData.languages || null,
            consultationFee: doctorData.consultationFee || null,
            profilePictureUrl: doctorData.profilePictureUrl || null,
            profileImageUrl: doctorData.profileImageUrl || doctorData.profilePictureUrl || null,
            licenseDocumentUrl: doctorData.licenseDocumentUrl || null,
            certificateUrl: doctorData.certificateUrl || null,
            firstName: doctorData.firstName || '',
            lastName: doctorData.lastName || '',
            // Add placeholder data for UI demo
            rating: Math.floor(Math.random() * 5) + 1,
            reviewCount: Math.floor(Math.random() * 50)
          });
        });
        
        setDoctors(doctorsList);
        setFilteredDoctors(doctorsList);
        
        logInfo({
          message: 'Doctors data fetched successfully',
          context: 'FindDoctorsPage',
          data: { count: doctorsList.length }
        });
      } catch (error) {
        logError({
          message: 'Error fetching doctors data',
          context: 'FindDoctorsPage',
          data: { error }
        });
      } finally {
        setIsDataLoading(false);
        perfTracker.stop();
      }
    };
    
    fetchDoctors();
  }, [user, userProfile]);
  
  // Handle search and filter
  useEffect(() => {
    if (doctors.length === 0) return;
    
    let results = [...doctors];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(doctor => 
        `${doctor.firstName || ''} ${doctor.lastName || ''}`.toLowerCase().includes(term) ||
        (doctor.specialty && doctor.specialty.toLowerCase().includes(term)) ||
        (doctor.location && doctor.location.toLowerCase().includes(term))
      );
    }
    
    // Apply specialty filter
    if (specialtyFilter) {
      results = results.filter(doctor => 
        doctor.specialty === specialtyFilter
      );
    }
    
    setFilteredDoctors(results);
    
    logInfo({
      message: 'Doctors search/filter applied',
      context: 'FindDoctorsPage',
      data: { 
        searchTerm, 
        specialtyFilter, 
        resultCount: results.length 
      }
    });
  }, [searchTerm, specialtyFilter, doctors]);
  
  // Handle view doctor profile
  const handleViewProfile = (doctorId: string) => {
    logInfo({
      message: 'View doctor profile clicked',
      context: 'FindDoctorsPage',
      data: { doctorId }
    });
    
    // In a real implementation, this would navigate to the doctor's profile page
    alert(`View profile functionality not implemented yet for doctor ID: ${doctorId}`);
  };
  
  // Handle book appointment
  const handleBookAppointment = (doctorId: string) => {
    logInfo({
      message: 'Book appointment clicked',
      context: 'FindDoctorsPage',
      data: { doctorId }
    });
    
    // Navigate to appointment booking page with doctor ID
    window.location.href = `/patient/appointments/new?doctorId=${doctorId}`;
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Show loading state
  if (isLoading || isDataLoading) {
    return (
      <Layout title="Find Doctors - Health Appointment System">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading doctors...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Find Doctors - Health Appointment System">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Find Doctors</h1>
          <p className="text-gray-600 mt-1">
            Search for healthcare providers and book appointments
          </p>
        </div>
        
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faSearch} className="mr-2" />
                Search Doctors
              </label>
              <Input
                id="search"
                type="text"
                placeholder="Search by name, specialty, or location"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            
            {/* Specialty Filter */}
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                Filter by Specialty
              </label>
              <Select
                id="specialty"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
              >
                <option value="">All Specialties</option>
                {SPECIALTIES.map((specialty) => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
            </h2>
          </div>
          
          {filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDoctors.map((doctor) => (
                <DoctorCard 
                  key={doctor.id}
                  doctor={doctor}
                  onViewProfile={handleViewProfile}
                  onBookAppointment={handleBookAppointment}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <FontAwesomeIcon icon={faStethoscope} className="text-gray-300 text-5xl mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No Doctors Found</h3>
              <p className="text-gray-500 mt-1">
                Try adjusting your search criteria or removing filters
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
