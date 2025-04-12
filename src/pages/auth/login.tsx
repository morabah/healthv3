/**
 * Login Page
 * Allows users to authenticate with the Health Appointment System
 */

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { logInfo } from '../../lib/logger';

export default function Login() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Log page visit
  React.useEffect(() => {
    logInfo({
      message: 'Login page visited',
      context: 'LoginPage'
    });
  }, []);
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (!loading && user) {
      logInfo({
        message: 'Redirecting authenticated user from login page',
        context: 'LoginPage',
        data: { userId: user.uid }
      });
      router.push('/');
    }
  }, [user, loading, router]);

  return (
    <>
      <Head>
        <title>Login - Health Appointment System</title>
        <meta name="description" content="Log in to your Health Appointment System account" />
      </Head>

      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
          Login
        </h1>
        
        <div className="card mb-8">
          <div className="card-body">
            <p className="text-lg mb-4 text-center">
              This is the Login page of the Health Appointment System.
            </p>
            <p className="text-gray-600 text-center mb-4">
              Placeholder content for the Login page. This will be replaced with an actual login form.
            </p>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-2">
                Don&apos;t have an account?
              </p>
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
