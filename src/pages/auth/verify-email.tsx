/**
 * Email Verification Page
 * Displayed after registration to prompt users to verify their email
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { sendEmailVerification } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function VerifyEmail() {
  const router = useRouter();
  const { user, loading, userProfile } = useAuth();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  
  // Log page visit
  useEffect(() => {
    logInfo({
      message: 'Email verification page visited',
      context: 'VerifyEmailPage'
    });
  }, []);
  
  // Check if user is authenticated and redirect if not
  useEffect(() => {
    if (!loading) {
      if (!user) {
        logInfo({
          message: 'Redirecting unauthenticated user from email verification page',
          context: 'VerifyEmailPage'
        });
        router.push('/auth/login');
      } else if (user.emailVerified) {
        setIsVerified(true);
        logInfo({
          message: 'User email already verified',
          context: 'VerifyEmailPage',
          data: { userId: user.uid }
        });
      }
    }
  }, [user, loading, router]);
  
  // Refresh verification status periodically
  useEffect(() => {
    if (!user || isVerified) return;
    
    const checkVerificationStatus = async () => {
      try {
        // Force refresh the token to check if email has been verified
        await user.reload();
        if (user.emailVerified) {
          setIsVerified(true);
          logInfo({
            message: 'Email verification detected',
            context: 'VerifyEmailPage',
            data: { userId: user.uid }
          });
        }
      } catch (err) {
        logError({
          message: 'Error checking email verification status',
          context: 'VerifyEmailPage',
          error: err
        });
      }
    };
    
    // Check every 5 seconds
    const interval = setInterval(checkVerificationStatus, 5000);
    return () => clearInterval(interval);
  }, [user, isVerified]);
  
  // Handle cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setTimeout(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [resendCooldown]);
  
  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!user || resendCooldown > 0) return;
    
    const perfTracker = trackPerformance('resendVerificationEmail', 'VerifyEmailPage');
    
    try {
      await sendEmailVerification(user);
      setVerificationSent(true);
      setResendCooldown(60); // 60 seconds cooldown
      setError(null);
      
      logInfo({
        message: 'Verification email resent successfully',
        context: 'VerifyEmailPage',
        data: { userId: user.uid }
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setVerificationSent(false);
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email. Please try again later.');
      
      logError({
        message: 'Failed to resend verification email',
        context: 'VerifyEmailPage',
        error: err
      });
    } finally {
      perfTracker.stop();
    }
  };
  
  // Handle continue to dashboard
  const handleContinue = () => {
    if (!userProfile) return;
    
    logInfo({
      message: 'User continuing to dashboard after email verification',
      context: 'VerifyEmailPage',
      data: { userId: user?.uid, userType: userProfile.userType }
    });
    
    // Redirect based on user type
    switch (userProfile.userType) {
      case 'PATIENT':
        router.push('/patient/dashboard');
        break;
      case 'DOCTOR':
        router.push('/doctor/dashboard');
        break;
      case 'ADMIN':
        router.push('/admin/dashboard');
        break;
      default:
        router.push('/');
    }
  };
  
  // If loading, show loading state
  if (loading) {
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
        <title>Verify Your Email - Health Appointment System</title>
        <meta name="description" content="Verify your email address to complete registration" />
      </Head>
      
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          {isVerified ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <FontAwesomeIcon 
                  icon={faCheckCircle} 
                  className="h-10 w-10 text-green-600" 
                />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="mt-2 text-gray-600">
                Your email has been successfully verified. You can now access all features of the Health Appointment System.
              </p>
              <div className="mt-6">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleContinue}
                >
                  Continue to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                <FontAwesomeIcon 
                  icon={faEnvelope} 
                  className="h-10 w-10 text-blue-600" 
                />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">Verify Your Email</h2>
              <p className="mt-2 text-gray-600">
                We've sent a verification email to <strong>{user?.email}</strong>. 
                Please check your inbox and click the verification link to activate your account.
              </p>
              
              {verificationSent && (
                <Alert 
                  variant="success" 
                  className="mt-4"
                >
                  Verification email sent successfully!
                </Alert>
              )}
              
              {error && (
                <Alert 
                  variant="error" 
                  dismissible 
                  onDismiss={() => setError(null)}
                  className="mt-4"
                >
                  {error}
                </Alert>
              )}
              
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-4">
                  Didn't receive the email? Check your spam folder or click the button below to resend.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0}
                >
                  {resendCooldown > 0 
                    ? `Resend Email (${resendCooldown}s)` 
                    : 'Resend Verification Email'}
                </Button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center">
                  <FontAwesomeIcon 
                    icon={faExclamationTriangle} 
                    className="h-5 w-5 text-yellow-500 mr-2" 
                  />
                  <p className="text-sm text-gray-600 text-left">
                    <strong>Note:</strong> You need to verify your email to access all features of the Health Appointment System.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
