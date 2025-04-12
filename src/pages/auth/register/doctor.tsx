/**
 * Doctor Registration Page
 * Allows healthcare providers to register in the Health Appointment System
 */

import React, { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faLock, 
  faMedkit,
  faIdCard,
  faMapMarkerAlt,
  faLanguage,
  faDollarSign,
  faFileUpload
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { getFirebaseAuth, getFirebaseFirestore, getFirebaseStorage } from '@/lib/firebaseClient';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';
import { UserType, VerificationStatus } from '@/types/enums';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

// Define interface for form data
interface DoctorRegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  specialty: string;
  licenseNumber: string;
  yearsOfExperience: string;
  location: string;
  languages: string;
  consultationFee: string;
  profilePicture: File | null;
  licenseDocument: File | null;
}

// Define interface for form errors
interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  specialty?: string;
  licenseNumber?: string;
  yearsOfExperience?: string;
  location?: string;
  languages?: string;
  consultationFee?: string;
  profilePicture?: string;
  licenseDocument?: string;
  general?: string;
}

// Common medical specialties
const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'Hematology',
  'Infectious Disease',
  'Internal Medicine',
  'Nephrology',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Urology'
];

export default function DoctorRegistration() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const auth = getFirebaseAuth();
  const firestore = getFirebaseFirestore();
  const storage = getFirebaseStorage();
  
  // Form state
  const [formData, setFormData] = useState<DoctorRegistrationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    specialty: '',
    licenseNumber: '',
    yearsOfExperience: '',
    location: '',
    languages: '',
    consultationFee: '',
    profilePicture: null,
    licenseDocument: null
  });
  
  // File input refs
  const profilePictureRef = useRef<HTMLInputElement>(null);
  const licenseDocumentRef = useRef<HTMLInputElement>(null);
  
  // Form errors state
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Log page visit
  React.useEffect(() => {
    logInfo({
      message: 'Doctor registration page visited',
      context: 'DoctorRegistrationPage'
    });
  }, []);
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (!loading && user) {
      logInfo({
        message: 'Redirecting authenticated user from doctor registration page',
        context: 'DoctorRegistrationPage',
        data: { userId: user.uid }
      });
      router.push('/');
    }
  }, [user, loading, router]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
  
  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      
      // Clear error when user uploads a file
      if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };
  
  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    
    if (step === 1) {
      // Validate personal information
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number is invalid';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (step === 2) {
      // Validate professional information
      if (!formData.specialty) {
        newErrors.specialty = 'Specialty is required';
      }
      
      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required';
      }
      
      if (!formData.yearsOfExperience.trim()) {
        newErrors.yearsOfExperience = 'Years of experience is required';
      } else if (isNaN(Number(formData.yearsOfExperience)) || Number(formData.yearsOfExperience) < 0) {
        newErrors.yearsOfExperience = 'Years of experience must be a positive number';
      }
      
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
      }
      
      if (!formData.languages.trim()) {
        newErrors.languages = 'Languages are required';
      }
      
      if (!formData.consultationFee.trim()) {
        newErrors.consultationFee = 'Consultation fee is required';
      } else if (isNaN(Number(formData.consultationFee)) || Number(formData.consultationFee) < 0) {
        newErrors.consultationFee = 'Consultation fee must be a positive number';
      }
    } else if (step === 3) {
      // Validate documents
      if (!formData.profilePicture) {
        newErrors.profilePicture = 'Profile picture is required';
      }
      
      if (!formData.licenseDocument) {
        newErrors.licenseDocument = 'License document is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Upload file to Firebase Storage
  const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate final step
    if (!validateStep(currentStep)) {
      return;
    }
    
    // Start performance tracking
    const perfTracker = trackPerformance('doctorRegistration', 'DoctorRegistrationPage');
    
    // Set loading state
    setIsSubmitting(true);
    
    // Log registration attempt
    logInfo({
      message: 'Doctor registration attempt started',
      context: 'DoctorRegistrationPage',
      data: { 
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialty: formData.specialty
      }
    });
    
    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // Upload files
      let profilePictureUrl = '';
      let licenseDocumentUrl = '';
      
      if (formData.profilePicture) {
        const fileName = `profile_pictures/${Date.now()}_${formData.profilePicture.name}`;
        profilePictureUrl = await uploadFile(formData.profilePicture, fileName);
      }
      
      if (formData.licenseDocument) {
        const fileName = `license_documents/${Date.now()}_${formData.licenseDocument.name}`;
        licenseDocumentUrl = await uploadFile(formData.licenseDocument, fileName);
      }
      
      // Create user document in Firestore
      const userProfile = {
        userId: user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null,
        userType: UserType.DOCTOR,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        phoneVerified: false,
        verificationStatus: VerificationStatus.PENDING,
      };
      
      await setDoc(doc(firestore, 'users', user.uid), userProfile);
      
      // Create doctor profile in Firestore
      const doctorProfile = {
        userId: user.uid,
        specialty: formData.specialty,
        licenseNumber: formData.licenseNumber,
        yearsOfExperience: Number(formData.yearsOfExperience),
        location: formData.location,
        languages: formData.languages.split(',').map(lang => lang.trim()),
        consultationFee: Number(formData.consultationFee),
        profilePictureUrl,
        licenseDocumentUrl,
        verificationStatus: VerificationStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(doc(firestore, 'doctors', user.uid), doctorProfile);
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Log successful registration
      logInfo({
        message: 'Doctor registration successful',
        context: 'DoctorRegistrationPage',
        data: { 
          email: formData.email,
          userId: user.uid
        }
      });
      
      // Show success message
      setSubmitSuccess(true);
      
      // Redirect to verification page after a short delay
      setTimeout(() => {
        router.push('/auth/pending-verification');
      }, 2000);
      
    } catch (err: any) {
      // Handle specific error codes
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      } else if (err.code) {
        // Handle other error codes from our mock implementation
        errorMessage = err.message || 'Registration failed. Please try again.';
      }
      
      setErrors({
        general: errorMessage
      });
      
      // Log error
      logError({
        message: 'Doctor registration failed',
        context: 'DoctorRegistrationPage',
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
  
  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 1:
        return (
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
                required
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
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Professional Information</h2>
            
            {/* Specialty */}
            <div>
              <label htmlFor="specialty" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faMedkit} className="mr-2 text-gray-400" />
                Medical Specialty
              </label>
              <select
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                  errors.specialty ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
                }`}
                required
              >
                <option value="" disabled>Select specialty</option>
                {SPECIALTIES.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
                <option value="Other">Other</option>
              </select>
              {errors.specialty && (
                <p className="mt-2 text-sm text-red-600">{errors.specialty}</p>
              )}
            </div>
            
            {/* License Number */}
            <div>
              <label htmlFor="licenseNumber" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faIdCard} className="mr-2 text-gray-400" />
                License Number
              </label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                value={formData.licenseNumber}
                onChange={handleChange}
                error={errors.licenseNumber}
                required
              />
            </div>
            
            {/* Years of Experience */}
            <div>
              <label htmlFor="yearsOfExperience" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                Years of Experience
              </label>
              <Input
                id="yearsOfExperience"
                name="yearsOfExperience"
                type="number"
                min="0"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                error={errors.yearsOfExperience}
                required
              />
            </div>
            
            {/* Location */}
            <div>
              <label htmlFor="location" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-400" />
                Practice Location
              </label>
              <Input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                error={errors.location}
                placeholder="City, State/Province, Country"
                required
              />
            </div>
            
            {/* Languages */}
            <div>
              <label htmlFor="languages" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faLanguage} className="mr-2 text-gray-400" />
                Languages Spoken
              </label>
              <Input
                id="languages"
                name="languages"
                type="text"
                value={formData.languages}
                onChange={handleChange}
                error={errors.languages}
                placeholder="English, Spanish, etc. (comma-separated)"
                required
              />
            </div>
            
            {/* Consultation Fee */}
            <div>
              <label htmlFor="consultationFee" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-gray-400" />
                Consultation Fee (USD)
              </label>
              <Input
                id="consultationFee"
                name="consultationFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.consultationFee}
                onChange={handleChange}
                error={errors.consultationFee}
                required
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
            <p className="text-sm text-gray-600 mb-4">
              Please upload the required documents to complete your registration. These documents will be verified by our team.
            </p>
            
            {/* Profile Picture */}
            <div>
              <label htmlFor="profilePicture" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                Profile Picture
              </label>
              <div className="mt-1 flex items-center">
                <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                  {formData.profilePicture ? (
                    <img 
                      src={URL.createObjectURL(formData.profilePicture)} 
                      alt="Profile preview" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </span>
                <button
                  type="button"
                  className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => profilePictureRef.current?.click()}
                >
                  Change
                </button>
                <input
                  ref={profilePictureRef}
                  id="profilePicture"
                  name="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {errors.profilePicture && (
                <p className="mt-2 text-sm text-red-600">{errors.profilePicture}</p>
              )}
            </div>
            
            {/* License Document */}
            <div>
              <label htmlFor="licenseDocument" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faFileUpload} className="mr-2 text-gray-400" />
                License Document
              </label>
              <div className="mt-1 flex items-center">
                <button
                  type="button"
                  className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => licenseDocumentRef.current?.click()}
                >
                  {formData.licenseDocument ? 'Change' : 'Upload'}
                </button>
                <span className="ml-3 text-sm text-gray-500">
                  {formData.licenseDocument ? formData.licenseDocument.name : 'No file selected'}
                </span>
                <input
                  ref={licenseDocumentRef}
                  id="licenseDocument"
                  name="licenseDocument"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Upload a clear image or PDF of your medical license
              </p>
              {errors.licenseDocument && (
                <p className="mt-2 text-sm text-red-600">{errors.licenseDocument}</p>
              )}
            </div>
            
            {/* Terms and Conditions */}
            <div className="flex items-start mt-6">
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
          </div>
        );
      default:
        return null;
    }
  };
  
  // Render step indicator
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            {/* Step circle */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index + 1 === currentStep
                  ? 'bg-blue-600 text-white'
                  : index + 1 < currentStep
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
            
            {/* Connector line */}
            {index < totalSteps - 1 && (
              <div
                className={`h-1 w-12 ${
                  index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  return (
    <>
      <Head>
        <title>Doctor Registration - Health Appointment System</title>
        <meta name="description" content="Register as a healthcare provider with Health Appointment System" />
      </Head>
      
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">
              Doctor Registration
            </h1>
            <p className="mt-2 text-gray-600">
              Create your healthcare provider account
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
              Registration successful! Your account is pending verification. Redirecting...
            </Alert>
          )}
          
          {renderStepIndicator()}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStepContent(currentStep)}
            
            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  variant="primary"
                  className="ml-auto"
                  onClick={handleNextStep}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  className="ml-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              )}
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
