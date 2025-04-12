/**
 * Authentication Context
 * Provides authentication state and user profile data throughout the application
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getFirebaseAuth, getFirebaseFirestore } from '../lib/firebaseClient';
import { UserProfile } from '../types/user';
import { logInfo, logError } from '../lib/logger';
import { trackPerformance } from '../lib/performance';

// Context interface defining what data and functions will be available
interface AuthContextType {
  // Firebase authentication state
  user: User | null;
  loading: boolean;
  error: Error | undefined;
  
  // User profile data from Firestore
  userProfile: UserProfile | null;
  profileLoading: boolean;
  
  // Sign out function
  signOut: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: undefined,
  userProfile: null,
  profileLoading: true,
  signOut: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get Firebase auth instance
  const auth = getFirebaseAuth();
  const firestore = getFirebaseFirestore();
  
  // Use the useAuthState hook to track authentication state
  const [user, loading, error] = useAuthState(auth);
  
  // State for user profile data from Firestore
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  
  // Function to sign out
  const signOut = async () => {
    try {
      logInfo({
        message: 'User signing out',
        context: 'AuthContext',
        data: { userId: user?.uid }
      });
      
      await auth.signOut();
      
      // Clear user profile state
      setUserProfile(null);
      
      logInfo({
        message: 'User signed out successfully',
        context: 'AuthContext'
      });
    } catch (error) {
      logError({
        message: 'Error signing out',
        context: 'AuthContext',
        data: { error }
      });
      throw error;
    }
  };
  
  // Effect to fetch user profile data when auth state changes
  useEffect(() => {
    // Skip if still loading or no user
    if (loading || !user) {
      if (!loading && !user) {
        // User is definitely signed out
        setProfileLoading(false);
        setUserProfile(null);
        
        logInfo({
          message: 'No authenticated user',
          context: 'AuthContext'
        });
      }
      return;
    }
    
    const fetchUserProfile = async () => {
      // Start performance tracking
      const perfTracker = trackPerformance('fetchUserProfile', 'AuthContext');
      
      try {
        setProfileLoading(true);
        
        logInfo({
          message: 'Fetching user profile',
          context: 'AuthContext',
          data: { userId: user.uid }
        });
        
        // Get user document from Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          // User profile exists in Firestore
          const userData = userDoc.data() as UserProfile;
          setUserProfile(userData);
          
          logInfo({
            message: 'User profile fetched successfully',
            context: 'AuthContext',
            data: { userId: user.uid, userType: userData.userType }
          });
        } else {
          // User authenticated but no profile in Firestore
          setUserProfile(null);
          
          logInfo({
            message: 'User authenticated but no profile found',
            context: 'AuthContext',
            data: { userId: user.uid }
          });
        }
      } catch (error) {
        logError({
          message: 'Error fetching user profile',
          context: 'AuthContext',
          data: { userId: user.uid, error }
        });
        
        setUserProfile(null);
      } finally {
        setProfileLoading(false);
        perfTracker.stop({ userId: user.uid });
      }
    };
    
    // Log authentication state change
    logInfo({
      message: 'User authenticated',
      context: 'AuthContext',
      data: { 
        userId: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        isAnonymous: user.isAnonymous
      }
    });
    
    // Fetch the user profile
    fetchUserProfile();
  }, [user, loading, firestore]);
  
  // Create the value object that will be provided by the context
  const value = {
    user,
    loading,
    error,
    userProfile,
    profileLoading,
    signOut
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
