/**
 * Main Layout Component
 * Provides consistent layout structure across all pages
 */

import React from 'react';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { logInfo } from '../lib/logger';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Health Appointment System' 
}) => {
  const { user, userProfile, loading } = useAuth();

  // Log render for debugging purposes
  React.useEffect(() => {
    logInfo({
      message: 'Layout rendered',
      context: 'Layout',
      data: { 
        isAuthenticated: !!user,
        userType: userProfile?.userType || 'none',
        isLoading: loading
      }
    });
  }, [user, userProfile, loading]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Health Appointment System - Book appointments with healthcare providers" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navbar placeholder - will be implemented in a separate component */}
      <header className="bg-white shadow-sm">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-blue-600">Health Appointment System</div>
            <div className="flex space-x-4">
              {/* Navbar content will go here */}
              {user ? (
                <div className="text-sm text-gray-600">
                  Logged in as: {userProfile?.firstName || user.email}
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  {loading ? 'Loading...' : 'Not logged in'}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container-custom py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="container-custom py-6">
          <div className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Health Appointment System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
