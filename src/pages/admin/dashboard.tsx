/**
 * Admin Dashboard Page
 * Main dashboard for administrators to manage the system
 */

import React from 'react';
import Head from 'next/head';
import { UserType } from '../../types/enums';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { logInfo } from '../../lib/logger';

export default function AdminDashboard() {
  // Protect this route - only authenticated admins can access
  const { user, userProfile, isLoading } = useProtectedRoute({
    requiredUserTypes: [UserType.ADMIN],
    redirectTo: '/auth/login'
  });
  
  // Log page visit if authorized
  React.useEffect(() => {
    if (user && userProfile?.userType === UserType.ADMIN) {
      logInfo({
        message: 'Admin dashboard visited',
        context: 'AdminDashboard',
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
        <title>Admin Dashboard - Health Appointment System</title>
        <meta name="description" content="Administer the Health Appointment System" />
      </Head>

      <div>
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          Admin Dashboard
        </h1>
        
        <div className="card mb-8">
          <div className="card-body">
            <p className="text-lg mb-4">
              Welcome, Administrator {userProfile?.firstName} {userProfile?.lastName}
            </p>
            <p className="text-gray-600">
              This is a placeholder for the Admin Dashboard. This will be replaced with actual admin dashboard content, including user management, doctor verification, system statistics, etc.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
