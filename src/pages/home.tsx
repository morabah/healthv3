/**
 * Home Page
 * Landing page for the Health Appointment System
 */

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { UserType } from '../types/enums';
import { logInfo } from '../lib/logger';

export default function Home() {
  const { user, userProfile, loading } = useAuth();
  
  // Log page visit
  React.useEffect(() => {
    logInfo({
      message: 'Home page visited',
      context: 'HomePage',
      data: { isAuthenticated: !!user }
    });
  }, [user]);
  
  // Determine dashboard link based on user type
  const getDashboardLink = () => {
    if (!userProfile) return '/auth/login';
    
    switch (userProfile.userType) {
      case UserType.PATIENT:
        return '/patient/dashboard';
      case UserType.DOCTOR:
        return '/doctor/dashboard';
      case UserType.ADMIN:
        return '/admin/dashboard';
      default:
        return '/auth/login';
    }
  };

  return (
    <>
      <Head>
        <title>Health Appointment System - Home</title>
        <meta name="description" content="Book appointments with healthcare providers easily" />
      </Head>

      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-6">
          Health Appointment System
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Welcome to the Health Appointment System - your platform for managing healthcare appointments
        </p>
        
        <div className="space-y-4">
          {loading ? (
            <p>Loading...</p>
          ) : user ? (
            <div className="space-y-4">
              <p className="text-green-600">
                You are logged in as {userProfile?.firstName || user.email}
              </p>
              <div>
                <Link href={getDashboardLink()} className="btn-primary">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p>Please log in or register to continue</p>
              <div className="flex justify-center space-x-4">
                <Link href="/auth/login" className="btn-primary">
                  Login
                </Link>
                <Link href="/auth/register" className="btn-secondary">
                  Register
                </Link>
              </div>
            </div>
          )}
          
          <div className="mt-8 space-x-4">
            <Link href="/about" className="text-blue-600 hover:underline">
              About
            </Link>
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
