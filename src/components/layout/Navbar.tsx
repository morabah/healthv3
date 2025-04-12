/**
 * Navbar Component
 * Responsive navigation bar with conditional rendering based on authentication state
 */
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faTimes, 
  faBell, 
  faUserDoctor, 
  faUser, 
  faSignOutAlt, 
  faTachometerAlt 
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { UserType } from '@/types/enums';
import { logInfo } from '@/lib/logger';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const Navbar: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Handle user logout
  const handleLogout = async () => {
    try {
      logInfo({
        message: 'User initiated logout from navbar',
        context: 'Navbar',
        data: { userId: user?.uid }
      });
      
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Determine dashboard path based on user role
  const getDashboardPath = () => {
    if (!userProfile) return '/';
    
    switch (userProfile.userType) {
      case UserType.PATIENT:
        return '/dashboard/patient';
      case UserType.DOCTOR:
        return '/dashboard/doctor';
      case UserType.ADMIN:
        return '/dashboard/admin';
      default:
        return '/dashboard';
    }
  };
  
  // Determine profile path based on user role
  const getProfilePath = () => {
    if (!userProfile) return '/';
    
    switch (userProfile.userType) {
      case UserType.PATIENT:
        return '/profile/patient';
      case UserType.DOCTOR:
        return '/profile/doctor';
      case UserType.ADMIN:
        return '/profile/admin';
      default:
        return '/profile';
    }
  };
  
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#0d6efd]">Health Appointment</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium ${
              router.pathname === '/' 
                ? 'text-[#0d6efd] border-b-2 border-[#0d6efd]' 
                : 'text-gray-700 hover:text-[#0d6efd]'
            }`}>
              Home
            </Link>
            <Link href="/about" className={`px-3 py-2 rounded-md text-sm font-medium ${
              router.pathname === '/about' 
                ? 'text-[#0d6efd] border-b-2 border-[#0d6efd]' 
                : 'text-gray-700 hover:text-[#0d6efd]'
            }`}>
              About
            </Link>
            <Link href="/contact" className={`px-3 py-2 rounded-md text-sm font-medium ${
              router.pathname === '/contact' 
                ? 'text-[#0d6efd] border-b-2 border-[#0d6efd]' 
                : 'text-gray-700 hover:text-[#0d6efd]'
            }`}>
              Contact
            </Link>
            
            {/* Conditional links based on auth state */}
            {user && userProfile ? (
              <>
                <Link href="/main/find-doctors" className={`px-3 py-2 rounded-md text-sm font-medium ${
                  router.pathname === '/main/find-doctors' 
                    ? 'text-[#0d6efd] border-b-2 border-[#0d6efd]' 
                    : 'text-gray-700 hover:text-[#0d6efd]'
                }`}>
                  <FontAwesomeIcon icon={faUserDoctor} className="mr-1" />
                  Find Doctors
                </Link>
                
                {/* Notifications icon */}
                <Link href="/notifications" className="px-3 py-2 text-gray-700 hover:text-[#0d6efd] relative">
                  <FontAwesomeIcon icon={faBell} />
                  {/* Notification badge - will be dynamic later */}
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    2
                  </span>
                </Link>
                
                {/* User profile dropdown */}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button 
                      className="inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#0d6efd] focus:outline-none"
                      aria-label="User menu"
                    >
                      <span className="mr-1">
                        {userProfile.firstName} {userProfile.lastName}
                      </span>
                      <FontAwesomeIcon icon={faUser} />
                    </button>
                  </DropdownMenu.Trigger>
                  
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content 
                      className="min-w-[200px] bg-white rounded-md shadow-lg py-1 mt-2 right-0 z-10 border border-gray-200"
                      sideOffset={5}
                      align="end"
                    >
                      <DropdownMenu.Item className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Link href={getDashboardPath()} className="flex items-center">
                          <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenu.Item>
                      
                      <DropdownMenu.Item className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Link href={getProfilePath()} className="flex items-center">
                          <FontAwesomeIcon icon={faUser} className="mr-2" />
                          Profile
                        </Link>
                      </DropdownMenu.Item>
                      
                      <DropdownMenu.Separator className="my-1 border-t border-gray-200" />
                      
                      <DropdownMenu.Item className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full text-left"
                        >
                          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                          Logout
                        </button>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={`px-3 py-2 rounded-md text-sm font-medium ${
                  router.pathname === '/auth/login' 
                    ? 'text-[#0d6efd] border-b-2 border-[#0d6efd]' 
                    : 'text-gray-700 hover:text-[#0d6efd]'
                }`}>
                  Login
                </Link>
                <Link href="/auth/register" className="ml-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-[#0d6efd] hover:bg-blue-600">
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#0d6efd] focus:outline-none"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">{isMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className={`block px-3 py-2 rounded-md text-base font-medium ${
            router.pathname === '/' 
              ? 'text-[#0d6efd] bg-gray-50' 
              : 'text-gray-700 hover:text-[#0d6efd] hover:bg-gray-50'
          }`}>
            Home
          </Link>
          <Link href="/about" className={`block px-3 py-2 rounded-md text-base font-medium ${
            router.pathname === '/about' 
              ? 'text-[#0d6efd] bg-gray-50' 
              : 'text-gray-700 hover:text-[#0d6efd] hover:bg-gray-50'
          }`}>
            About
          </Link>
          <Link href="/contact" className={`block px-3 py-2 rounded-md text-base font-medium ${
            router.pathname === '/contact' 
              ? 'text-[#0d6efd] bg-gray-50' 
              : 'text-gray-700 hover:text-[#0d6efd] hover:bg-gray-50'
          }`}>
            Contact
          </Link>
          
          {/* Conditional links based on auth state */}
          {user && userProfile ? (
            <>
              <Link href="/main/find-doctors" className={`block px-3 py-2 rounded-md text-base font-medium ${
                router.pathname === '/main/find-doctors' 
                  ? 'text-[#0d6efd] bg-gray-50' 
                  : 'text-gray-700 hover:text-[#0d6efd] hover:bg-gray-50'
              }`}>
                <FontAwesomeIcon icon={faUserDoctor} className="mr-1" />
                Find Doctors
              </Link>
              
              <Link href="/notifications" className={`block px-3 py-2 rounded-md text-base font-medium ${
                router.pathname === '/notifications' 
                  ? 'text-[#0d6efd] bg-gray-50' 
                  : 'text-gray-700 hover:text-[#0d6efd] hover:bg-gray-50'
              }`}>
                <FontAwesomeIcon icon={faBell} className="mr-1" />
                Notifications
                <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  2
                </span>
              </Link>
              
              <Link href={getDashboardPath()} className={`block px-3 py-2 rounded-md text-base font-medium ${
                router.pathname.startsWith('/dashboard') 
                  ? 'text-[#0d6efd] bg-gray-50' 
                  : 'text-gray-700 hover:text-[#0d6efd] hover:bg-gray-50'
              }`}>
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-1" />
                Dashboard
              </Link>
              
              <Link href={getProfilePath()} className={`block px-3 py-2 rounded-md text-base font-medium ${
                router.pathname.startsWith('/profile') 
                  ? 'text-[#0d6efd] bg-gray-50' 
                  : 'text-gray-700 hover:text-[#0d6efd] hover:bg-gray-50'
              }`}>
                <FontAwesomeIcon icon={faUser} className="mr-1" />
                Profile
              </Link>
              
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#0d6efd] hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={`block px-3 py-2 rounded-md text-base font-medium ${
                router.pathname === '/auth/login' 
                  ? 'text-[#0d6efd] bg-gray-50' 
                  : 'text-gray-700 hover:text-[#0d6efd] hover:bg-gray-50'
              }`}>
                Login
              </Link>
              <Link href="/auth/register" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-[#0d6efd] hover:bg-blue-600 mt-1">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
