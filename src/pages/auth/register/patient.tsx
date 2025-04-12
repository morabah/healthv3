/**
 * Patient Registration Page
 * Allows users to register as a patient in the Health Appointment System
 */

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faLock, 
  faCalendarAlt, 
  faVenusMars, 
  faTint 
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebaseClient';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';
import { UserType, VerificationStatus } from '@/types/enums';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

// Define interface for form data
interface PatientRegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
}

// Define interface for form errors
interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  general?: string;
}

// Blood type options
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Gender options
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function PatientRegistration() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<PatientRegistrationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    bloodType: ''
  });
  
  // Form errors state
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Log page visit
  React.useEffect(() => {
    logInfo({
      message: 'Patient registration page visited',
      context: 'PatientRegistrationPage'
    });
  }, []);
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (!loading && user) {
      logInfo({
        message: 'Redirecting authenticated user from patient registration page',
        context: 'PatientRegistrationPage',
        data: { userId: user.uid }
      });
      router.push('/');
    }
  }, [user, loading, router]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate phone (optional but must be valid if provided)
    if (formData.phone.trim() && !/^\+?[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate date of birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      // Check if user is at least 18 years old
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      
      if (dob > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }
    
    // Validate gender
    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
    }
    
    // Validate blood type (optional)
    if (formData.bloodType && !BLOOD_TYPES.includes(formData.bloodType)) {
      newErrors.bloodType = 'Please select a valid blood type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Start performance tracking
    const perfTracker = trackPerformance('patientRegistration', 'PatientRegistrationPage');
    
    // Set loading state
    setIsSubmitting(true);
    
    // Log registration attempt
    logInfo({
      message: 'Patient registration attempt started',
      context: 'PatientRegistrationPage',
      data: { 
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      }
    });
    
    try {
      // Use direct Firebase Authentication instead of Cloud Functions
      const auth = getFirebaseAuth();
      const firestore = getFirebaseFirestore();
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      
      // Create user profile in Firestore
      const userProfile = {
        userId: user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null,
        userType: UserType.PATIENT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        phoneVerified: false,
        verificationStatus: VerificationStatus.VERIFIED,
      };
      
      await setDoc(doc(firestore, 'users', user.uid), userProfile);
      
      // Create patient profile in Firestore
      const patientProfile = {
        userId: user.uid,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodType: formData.bloodType || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(doc(firestore, 'patients', user.uid), patientProfile);
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Log successful registration
      logInfo({
        message: 'Patient registration successful',
        context: 'PatientRegistrationPage',
        data: { 
          email: formData.email,
          userId: user.uid
        }
      });
      
      // Show success message
      setSubmitSuccess(true);
      
      // Redirect to verification page after a short delay
      setTimeout(() => {
        router.push('/auth/verify-email');
      }, 2000);
      
    } catch (err: any) {
      // Handle specific error codes
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. It should be at least 6 characters.';
      } else if (err.code) {
        // Handle other Firebase Auth error codes
        errorMessage = err.message || 'Registration failed. Please try again.';
      }
      
      setErrors({
        general: errorMessage
      });
      
      // Log error
      logError({
        message: 'Patient registration failed',
        context: 'PatientRegistrationPage',
        data: { 
          email: formData.email,
          errorCode: err.code,
          errorMessage: err.message 
        }
      });
    } finally {
      setIsSubmitting(false);
      perfTracker.stop();
    }
  };
  
  return (
    <>
      <Head>
        <title>Patient Registration - Health Appointment System</title>
        <meta name="description" content="Register as a patient with Health Appointment System" />
      </Head>
      
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">
              Patient Registration
            </h1>
            <p className="mt-2 text-gray-600">
              Create your patient account to get started
            </p>
          </div>
          
          {errors.general && (
            <Alert 
              variant="error" 
              dismissible 
              onDismiss={() => setErrors(prev => ({ ...prev, general: undefined }))}
              className="mb-6"
            >
              {errors.general}
            </Alert>
          )}
          
          {submitSuccess && (
            <Alert 
              variant="success" 
              className="mb-6"
            >
              Registration successful! Redirecting you to verify your email...
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    required
                  />
                </div>
                
                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    required
                  />
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-400" />
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
              </div>
              
              {/* Phone */}
              <div>
                <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-400" />
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="Optional"
                />
              </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faLock} className="mr-2 text-gray-400" />
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faLock} className="mr-2 text-gray-400" />
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                />
              </div>
            </div>
            
            {/* Medical Information Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Medical Information</h2>
              
              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                  Date of Birth
                </label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  error={errors.dateOfBirth}
                  required
                />
              </div>
              
              {/* Gender */}
              <div>
                <label htmlFor="gender" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faVenusMars} className="mr-2 text-gray-400" />
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                    errors.gender ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  required
                >
                  <option value="" disabled>Select gender</option>
                  {GENDERS.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="mt-2 text-sm text-red-600">{errors.gender}</p>
                )}
              </div>
              
              {/* Blood Type */}
              <div>
                <label htmlFor="bloodType" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faTint} className="mr-2 text-gray-400" />
                  Blood Type
                </label>
                <select
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Unknown/Select blood type</option>
                  {BLOOD_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.bloodType && (
                  <p className="mt-2 text-sm text-red-600">{errors.bloodType}</p>
                )}
              </div>
            </div>
            
            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms and Conditions
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>
            
            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
