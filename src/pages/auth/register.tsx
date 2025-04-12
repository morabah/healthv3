/**
 * Register Page
 * Allows new users to create an account with the Health Appointment System
 */

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { logInfo } from '../../lib/logger';

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

      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
          Register
        </h1>
        
        <div className="card mb-8">
          <div className="card-body">
            <p className="text-lg mb-4 text-center">
              This is the Register page of the Health Appointment System.
            </p>
            <p className="text-gray-600 text-center mb-4">
              Placeholder content for the Register page. This will be replaced with an actual registration form.
            </p>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-2">
                Already have an account?
              </p>
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Login here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
