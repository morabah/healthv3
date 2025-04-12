/**
 * Doctor Dashboard Page
 * Main dashboard for doctors to view and manage their appointments and patients
 */

import React from 'react';
import Head from 'next/head';
import { UserType } from '../../types/enums';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { logInfo } from '../../lib/logger';

export default function DoctorDashboard() {
  // Protect this route - only authenticated doctors can access
  const { user, userProfile, isLoading } = useProtectedRoute({
    requiredUserTypes: [UserType.DOCTOR],
    redirectTo: '/auth/login'
  });
  
  // Log page visit if authorized
  React.useEffect(() => {
    if (user && userProfile?.userType === UserType.DOCTOR) {
      logInfo({
        message: 'Doctor dashboard visited',
        context: 'DoctorDashboard',
        data: { userId: user.uid }
      });
    }
  }, [user, userProfile]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Doctor Dashboard - Health Appointment System</title>
        <meta name="description" content="Manage your patients and appointments" />
      </Head>

      <div>
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          Doctor Dashboard
        </h1>
        
        <div className="card mb-8">
          <div className="card-body">
            <p className="text-lg mb-4">
              Welcome, Dr. {userProfile?.firstName} {userProfile?.lastName}
            </p>
            <p className="text-gray-600">
              This is a placeholder for the Doctor Dashboard. This will be replaced with actual doctor dashboard content, including patient management, appointment scheduling, availability settings, etc.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
