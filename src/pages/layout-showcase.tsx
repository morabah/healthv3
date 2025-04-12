/**
 * Layout Showcase Page
 * Demonstrates the Navbar and Footer components with different authentication states
 */
import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { User } from 'firebase/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { UserType } from '@/types/enums';
import { logInfo } from '@/lib/logger';

// Mock auth context for demonstration
import AuthContext from '@/context/AuthContext';

const LayoutShowcasePage: NextPage = () => {
  // State to toggle between different auth states
  const [authState, setAuthState] = useState<'none' | 'patient' | 'doctor' | 'admin'>('none');
  
  // Mock user data based on selected auth state
  const getMockAuthValue = () => {
    // Base state - logged out
    if (authState === 'none') {
      return {
        user: null,
        loading: false,
        error: undefined,
        userProfile: null,
        profileLoading: false,
        signOut: async () => {
          logInfo({
            message: 'Mock sign out called',
            context: 'LayoutShowcase'
          });
        }
      };
    }
    
    // Mock data for different user types
    const mockUser = {
      uid: 'mock-user-123',
      email: `${authState}@example.com`,
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({
        claims: {},
        expirationTime: '',
        issuedAtTime: '',
        authTime: '',
        signInProvider: null,
        signInSecondFactor: null,
        token: ''
      }),
      reload: async () => {},
      toJSON: () => ({})
    } as User;
    
    const mockUserProfile = {
      id: 'mock-user-123',
      email: `${authState}@example.com`,
      phone: '+1234567890',
      firstName: authState === 'patient' ? 'John' : authState === 'doctor' ? 'Dr. Jane' : 'Admin',
      lastName: 'Doe',
      userType: authState.toUpperCase() as UserType,
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
    };
    
    return {
      user: mockUser,
      loading: false,
      error: undefined,
      userProfile: mockUserProfile,
      profileLoading: false,
      signOut: async () => {
        logInfo({
          message: 'Mock sign out called',
          context: 'LayoutShowcase'
        });
        setAuthState('none');
      }
    };
  };
  
  return (
    <>
      <Head>
        <title>Layout Showcase - Health Appointment System</title>
        <meta name="description" content="Showcase of the layout components" />
      </Head>
      
      {/* Provide mock auth context */}
      <AuthContext.Provider value={getMockAuthValue()}>
        <div className="flex flex-col min-h-screen">
          {/* Navbar component */}
          <Navbar />
          
          {/* Main content */}
          <main className="flex-grow bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Layout Components Showcase</h1>
              
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Authentication State Controls</h2>
                <p className="mb-4">
                  Use the buttons below to toggle between different authentication states to see how the Navbar responds.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setAuthState('none')}
                    className={`px-4 py-2 rounded-md ${
                      authState === 'none' 
                        ? 'bg-[#0d6efd] text-white' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Logged Out
                  </button>
                  <button
                    onClick={() => setAuthState('patient')}
                    className={`px-4 py-2 rounded-md ${
                      authState === 'patient' 
                        ? 'bg-[#0d6efd] text-white' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Patient User
                  </button>
                  <button
                    onClick={() => setAuthState('doctor')}
                    className={`px-4 py-2 rounded-md ${
                      authState === 'doctor' 
                        ? 'bg-[#0d6efd] text-white' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Doctor User
                  </button>
                  <button
                    onClick={() => setAuthState('admin')}
                    className={`px-4 py-2 rounded-md ${
                      authState === 'admin' 
                        ? 'bg-[#0d6efd] text-white' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Admin User
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Current Authentication State</h2>
                <div className="bg-gray-100 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify({
                      ...getMockAuthValue(),
                      user: getMockAuthValue().user ? {
                        uid: getMockAuthValue().user.uid,
                        email: getMockAuthValue().user.email,
                        emailVerified: getMockAuthValue().user.emailVerified
                      } : null
                    }, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Component Features</h2>
                
                <h3 className="text-lg font-medium mt-4 mb-2">Navbar Features:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Responsive design with mobile menu</li>
                  <li>Conditional rendering based on authentication state</li>
                  <li>Active link highlighting</li>
                  <li>User dropdown menu with Radix UI</li>
                  <li>Notification badge</li>
                  <li>Dynamic dashboard and profile links based on user role</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-4 mb-2">Footer Features:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Responsive multi-column layout</li>
                  <li>Quick links section</li>
                  <li>Legal links (Terms of Service, Privacy Policy)</li>
                  <li>Social media icons</li>
                  <li>Copyright information with dynamic year</li>
                </ul>
              </div>
            </div>
          </main>
          
          {/* Footer component */}
          <Footer />
        </div>
      </AuthContext.Provider>
    </>
  );
};

export default LayoutShowcasePage;
