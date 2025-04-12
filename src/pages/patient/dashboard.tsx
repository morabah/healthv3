/**
 * Patient Dashboard Page
 * Main dashboard for patients to view and manage their appointments
 */

import React from 'react';
import Head from 'next/head';
import { UserType } from '../../types/enums';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { logInfo } from '../../lib/logger';

export default function PatientDashboard() {
  // Protect this route - only authenticated patients can access
  const { user, userProfile, isLoading } = useProtectedRoute({
    requiredUserTypes: [UserType.PATIENT],
    redirectTo: '/auth/login'
  });
  
  // Log page visit if authorized
  React.useEffect(() => {
    if (user && userProfile?.userType === UserType.PATIENT) {
      logInfo({
        message: 'Patient dashboard visited',
        context: 'PatientDashboard',
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
        <title>Patient Dashboard - Health Appointment System</title>
        <meta name="description" content="Manage your healthcare appointments" />
      </Head>

      <div>
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          Patient Dashboard
        </h1>
        
        <div className="card mb-8">
          <div className="card-body">
            <p className="text-lg mb-4">
              Welcome, {userProfile?.firstName} {userProfile?.lastName}
            </p>
            <p className="text-gray-600">
              This is a placeholder for the Patient Dashboard. This will be replaced with actual patient dashboard content, including appointment management, medical history, etc.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
