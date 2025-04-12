/**
 * Pending Verification Page
 * Displayed to doctors after registration to inform them about the pending verification process
 */

import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faCheckCircle, 
  faIdCard, 
  faUserMd, 
  faEnvelope 
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { logInfo } from '@/lib/logger';
import { UserType } from '@/types/enums';
import Button from '@/components/ui/Button';

export default function PendingVerification() {
  const router = useRouter();
  const { user, loading, userProfile } = useAuth();
  
  // Log page visit
  useEffect(() => {
    logInfo({
      message: 'Pending verification page visited',
      context: 'PendingVerificationPage'
    });
  }, []);
  
  // Check if user is authenticated and redirect if not
  useEffect(() => {
    if (!loading) {
      if (!user) {
        logInfo({
          message: 'Redirecting unauthenticated user from pending verification page',
          context: 'PendingVerificationPage'
        });
        router.push('/auth/login');
      } else if (userProfile && userProfile.userType !== UserType.DOCTOR) {
        // If not a doctor, redirect to appropriate dashboard
        logInfo({
          message: 'Non-doctor user redirected from pending verification page',
          context: 'PendingVerificationPage',
          data: { userId: user.uid, userType: userProfile.userType }
        });
        
        switch (userProfile.userType) {
          case UserType.PATIENT:
            router.push('/patient/dashboard');
            break;
          case UserType.ADMIN:
            router.push('/admin/dashboard');
            break;
          default:
            router.push('/');
        }
      }
    }
  }, [user, loading, userProfile, router]);
  
  // If loading, show loading state
  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Account Pending Verification - Health Appointment System</title>
        <meta name="description" content="Your doctor account is pending verification" />
      </Head>
      
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
              <FontAwesomeIcon 
                icon={faClock} 
                className="h-10 w-10 text-yellow-600" 
              />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Account Pending Verification</h2>
            <p className="mt-2 text-gray-600">
              Thank you for registering as a healthcare provider with the Health Appointment System.
              Your account is currently pending verification by our administrative team.
            </p>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">Verification Process</h3>
              <ul className="mt-4 space-y-6">
                <li className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                      <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Email Verification</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Please verify your email address by clicking the link sent to your inbox.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                      <FontAwesomeIcon icon={faIdCard} className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">License Verification</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Our team will verify your medical license information with the appropriate authorities.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100">
                      <FontAwesomeIcon icon={faUserMd} className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Credentials Review</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      We'll review your professional credentials, experience, and specialties.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                      <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Account Activation</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Once verified, your account will be activated and you'll receive a confirmation email.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                This process typically takes 1-3 business days. You'll be notified via email once your account is verified.
              </p>
              
              <div className="flex flex-col sm:flex-row sm:justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                >
                  Return to Home
                </Button>
                
                <Link href="/contact" passHref>
                  <Button variant="secondary">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
