/**
 * Login Page
 * Allows users to authenticate with the Health Appointment System
 */

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { UserType } from '@/types/enums';

export default function Login() {
  const router = useRouter();
  const { user, loading, userProfile } = useAuth();
  const auth = getFirebaseAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Log page visit
  React.useEffect(() => {
    logInfo({
      message: 'Login page visited',
      context: 'LoginPage'
    });
  }, []);
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (!loading && user && userProfile) {
      logInfo({
        message: 'Redirecting authenticated user from login page',
        context: 'LoginPage',
        data: { userId: user.uid, userType: userProfile.userType }
      });
      
      // Redirect based on user role
      switch (userProfile.userType) {
        case UserType.PATIENT:
          router.push('/dashboard/patient');
          break;
        case UserType.DOCTOR:
          router.push('/dashboard/doctor');
          break;
        case UserType.ADMIN:
          router.push('/dashboard/admin');
          break;
        default:
          router.push('/');
      }
    }
  }, [user, loading, userProfile, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError(null);
    
    // Validate form
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    // Start performance tracking
    const perfTracker = trackPerformance('loginAttempt', 'LoginPage');
    
    // Log login attempt
    logInfo({
      message: 'Login attempt started',
      context: 'LoginPage',
      data: { email }
    });
    
    // Set loading state
    setIsSubmitting(true);
    
    try {
      // Set persistence based on remember me option
      // Note: Firebase web SDK handles this automatically through browser storage
      
      // Attempt to sign in
      await signInWithEmailAndPassword(auth, email, password);
      
      // Log successful login
      logInfo({
        message: 'Login successful',
        context: 'LoginPage',
        data: { email }
      });
      
      // Note: Redirect will happen in the useEffect above when user state updates
    } catch (err: any) {
      // Handle specific error codes
      let errorMessage = 'Failed to sign in. Please check your credentials.';
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      }
      
      setError(errorMessage);
      
      // Log error
      logError({
        message: 'Login failed',
        context: 'LoginPage',
        data: { email, errorCode: err.code, errorMessage: err.message }
      });
    } finally {
      setIsSubmitting(false);
      perfTracker.stop();
    }
  };

  return (
    <>
      <Head>
        <title>Login - Health Appointment System</title>
        <meta name="description" content="Log in to your Health Appointment System account" />
      </Head>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h1 className="text-3xl font-bold text-center text-blue-600">
              Welcome Back
            </h1>
            <p className="mt-2 text-center text-gray-600">
              Sign in to access your Health Appointment System account
            </p>
          </div>
          
          {error && (
            <Alert 
              variant="error" 
              dismissible 
              onDismiss={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-400" />
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faLock} className="mr-2 text-gray-400" />
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link 
                  href="/auth/forgot-password" 
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full flex justify-center items-center"
                disabled={isSubmitting}
              >
                <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                href="/auth/register" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
