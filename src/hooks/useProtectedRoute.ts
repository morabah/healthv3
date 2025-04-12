/**
 * Protected Route Hook
 * Handles authentication and authorization for protected routes
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserType } from '../types/enums';
import { useAuth } from '../context/AuthContext';
import { logInfo, logWarn } from '../lib/logger';

interface UseProtectedRouteOptions {
  /** Required user types for accessing this route */
  requiredUserTypes?: UserType[];
  /** Where to redirect if authentication fails */
  redirectTo?: string;
  /** Whether to check for profile data in addition to auth */
  requireProfile?: boolean;
}

/**
 * Hook to protect routes based on authentication and user type
 * @param options Configuration options for the protected route
 * @returns Object containing auth state and loading status
 */
export const useProtectedRoute = ({
  requiredUserTypes,
  redirectTo = '/auth/login',
  requireProfile = true,
}: UseProtectedRouteOptions = {}) => {
  const router = useRouter();
  const { user, userProfile, loading, profileLoading } = useAuth();
  
  // Determine if we're still loading auth state
  const isLoading = loading || (requireProfile && profileLoading);
  
  useEffect(() => {
    // Skip checks if still loading
    if (isLoading) return;
    
    // If no user is logged in, redirect to login
    if (!user) {
      logWarn({
        message: 'Unauthorized access attempt to protected route',
        context: 'useProtectedRoute',
        data: { path: router.pathname, redirectTo }
      });
      
      router.push(redirectTo);
      return;
    }
    
    // If profile is required but not available
    if (requireProfile && !userProfile) {
      logWarn({
        message: 'User authenticated but no profile found',
        context: 'useProtectedRoute',
        data: { userId: user.uid, path: router.pathname, redirectTo }
      });
      
      router.push(redirectTo);
      return;
    }
    
    // If specific user types are required, check if the user has one of them
    if (requiredUserTypes && requiredUserTypes.length > 0) {
      if (!userProfile || !requiredUserTypes.includes(userProfile.userType)) {
        logWarn({
          message: 'User does not have required role for this route',
          context: 'useProtectedRoute',
          data: { 
            userId: user.uid, 
            userType: userProfile?.userType, 
            requiredTypes: requiredUserTypes,
            path: router.pathname,
            redirectTo
          }
        });
        
        router.push(redirectTo);
        return;
      }
    }
    
    // User is authorized to access this route
    logInfo({
      message: 'User authorized for protected route',
      context: 'useProtectedRoute',
      data: { 
        userId: user.uid, 
        userType: userProfile?.userType,
        path: router.pathname
      }
    });
  }, [
    user, 
    userProfile, 
    loading, 
    profileLoading, 
    requiredUserTypes, 
    redirectTo, 
    requireProfile, 
    router, 
    isLoading
  ]);
  
  return {
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    hasRequiredRole: requiredUserTypes 
      ? !!userProfile && requiredUserTypes.includes(userProfile.userType)
      : true
  };
};

export default useProtectedRoute;
