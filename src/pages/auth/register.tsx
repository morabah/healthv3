/**
 * Register Page
 * Allows new users to create an account with the Health Appointment System
 */

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserInjured, 
  faUserMd, 
  faArrowRight 
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { logInfo } from '@/lib/logger';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function Register() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Log page visit
  React.useEffect(() => {
    logInfo({
      message: 'Register page visited',
      context: 'RegisterPage'
    });
  }, []);
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (!loading && user) {
      logInfo({
        message: 'Redirecting authenticated user from register page',
        context: 'RegisterPage',
        data: { userId: user.uid }
      });
      router.push('/');
    }
  }, [user, loading, router]);

  return (
    <>
      <Head>
        <title>Register - Health Appointment System</title>
        <meta name="description" content="Create a new account with Health Appointment System" />
      </Head>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-600">
              Create Your Account
            </h1>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Choose the type of account you'd like to create with the Health Appointment System
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {/* Patient Registration Card */}
            <Card 
              hoverable 
              clickable 
              onClick={() => router.push('/auth/register/patient')}
              className="transition-all duration-300 hover:shadow-xl"
            >
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserInjured} className="text-blue-600 text-4xl" />
                  </div>
                </div>
                <CardTitle className="text-center text-2xl">Register as Patient</CardTitle>
                <CardDescription className="text-center mt-2">
                  Create a patient account to book appointments with healthcare providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Book appointments with specialists</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Manage your medical records</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Receive appointment reminders</span>
                    </li>
                  </ul>
                  
                  <Button 
                    variant="primary" 
                    className="w-full mt-6 flex items-center justify-center"
                    onClick={() => router.push('/auth/register/patient')}
                  >
                    Get Started
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Doctor Registration Card */}
            <Card 
              hoverable 
              clickable 
              onClick={() => router.push('/auth/register/doctor')}
              className="transition-all duration-300 hover:shadow-xl"
            >
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserMd} className="text-green-600 text-4xl" />
                  </div>
                </div>
                <CardTitle className="text-center text-2xl">Register as Doctor</CardTitle>
                <CardDescription className="text-center mt-2">
                  Create a healthcare provider account to offer your services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Manage your appointment schedule</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Connect with patients</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Build your professional profile</span>
                    </li>
                  </ul>
                  
                  <Button 
                    variant="primary" 
                    className="w-full mt-6 flex items-center justify-center bg-green-600 hover:bg-green-700"
                    onClick={() => router.push('/auth/register/doctor')}
                  >
                    Get Started
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
