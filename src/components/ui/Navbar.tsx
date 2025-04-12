/**
 * Navbar Component
 * A responsive navigation bar with mobile menu support
 */
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import Dropdown, { DropdownItem, DropdownSeparator } from './Dropdown';

export interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface NavbarProps {
  logo?: React.ReactNode;
  navItems?: NavItem[];
  className?: string;
  showAuthButtons?: boolean;
  onLogin?: () => void;
  onRegister?: () => void;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  logo,
  navItems = [],
  className = '',
  showAuthButtons = true,
  onLogin,
  onRegister,
  onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close mobile menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Default logo if none provided
  const defaultLogo = (
    <Link href="/" className="flex items-center">
      <span className="text-xl font-bold text-blue-600">Health Appointment System</span>
    </Link>
  );

  return (
    <nav className={`bg-white shadow-sm ${className}`}>
      <div className="container-custom mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            {logo || defaultLogo}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.isActive || router.pathname === item.href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:block">
            {showAuthButtons && (
              <div className="flex items-center space-x-3">
                {!loading && user ? (
                  <Dropdown
                    trigger={
                      <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                        <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
                        <span className="font-medium">
                          {userProfile?.firstName || user.email?.split('@')[0] || 'User'}
                        </span>
                      </button>
                    }
                  >
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      Signed in as <strong>{user.email}</strong>
                    </div>
                    <DropdownSeparator />
                    <DropdownItem onSelect={() => router.push('/profile')}>
                      My Profile
                    </DropdownItem>
                    <DropdownItem onSelect={() => router.push('/appointments')}>
                      My Appointments
                    </DropdownItem>
                    <DropdownSeparator />
                    <DropdownItem 
                      icon={faSignOutAlt}
                      onSelect={handleLogout}
                    >
                      Sign out
                    </DropdownItem>
                  </Dropdown>
                ) : (
                  <>
                    <Button 
                      variant="light" 
                      size="sm" 
                      onClick={onLogin}
                    >
                      Log in
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={onRegister}
                    >
                      Register
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
            >
              <span className="sr-only">{isMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              <FontAwesomeIcon 
                icon={isMenuOpen ? faXmark : faBars} 
                className="h-6 w-6" 
                aria-hidden="true" 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                item.isActive || router.pathname === item.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
        </div>
        
        {/* Mobile auth buttons */}
        {showAuthButtons && (
          <div className="pt-4 pb-3 border-t border-gray-200">
            {!loading && user ? (
              <div className="px-4 space-y-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                    <FontAwesomeIcon icon={faUser} className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {userProfile?.firstName} {userProfile?.lastName}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={closeMenu}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/appointments"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={closeMenu}
                  >
                    My Appointments
                  </Link>
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 space-y-2">
                <Button 
                  variant="light" 
                  size="sm" 
                  fullWidth 
                  onClick={() => {
                    onLogin?.();
                    closeMenu();
                  }}
                >
                  Log in
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  fullWidth 
                  onClick={() => {
                    onRegister?.();
                    closeMenu();
                  }}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
