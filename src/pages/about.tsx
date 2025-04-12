/**
 * About Page
 * Information about the Health Appointment System
 */
import React from 'react';
import { NextPage } from 'next';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserMd, 
  faHeartbeat, 
  faClipboardCheck, 
  faShieldAlt 
} from '@fortawesome/free-solid-svg-icons';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { logInfo } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';

const AboutPage: NextPage = () => {
  // Track performance of page rendering
  const perfTracker = trackPerformance('pageRender', 'AboutPage');
  
  // Log page visit
  logInfo({
    message: 'User visited about page',
    context: 'AboutPage'
  });
  
  // Stop performance tracking
  perfTracker.stop();
  
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">About Health Appointment System</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to make healthcare more accessible, efficient, and patient-centered through innovative technology.
            </p>
          </div>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:space-x-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="relative h-64 md:h-96 w-full rounded-lg bg-blue-100 flex items-center justify-center">
                {/* Placeholder for mission image */}
                <FontAwesomeIcon icon={faHeartbeat} className="text-blue-500 text-6xl" />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                At Health Appointment System, we believe that everyone deserves easy access to quality healthcare. Our platform bridges the gap between patients and healthcare providers, creating a seamless experience for scheduling appointments, managing health records, and receiving care.
              </p>
              <p className="text-gray-600">
                We're committed to using technology to solve healthcare challenges, improve patient outcomes, and make the healthcare journey more transparent and efficient for everyone involved.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Team</h2>
            <p className="mt-4 text-xl text-gray-600">Meet the dedicated professionals behind Health Appointment System</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <Card>
              <CardContent className="text-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUserMd} className="text-gray-400 text-4xl" />
                </div>
                <CardTitle className="mb-1">Dr. Sarah Johnson</CardTitle>
                <p className="text-blue-600 font-medium mb-2">Chief Medical Officer</p>
                <p className="text-gray-600">
                  Board-certified physician with over 15 years of experience in healthcare management and digital health innovation.
                </p>
              </CardContent>
            </Card>
            
            {/* Team Member 2 */}
            <Card>
              <CardContent className="text-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUserMd} className="text-gray-400 text-4xl" />
                </div>
                <CardTitle className="mb-1">Michael Chen</CardTitle>
                <p className="text-blue-600 font-medium mb-2">Chief Technology Officer</p>
                <p className="text-gray-600">
                  Technology leader with expertise in building secure, scalable healthcare platforms and implementing innovative solutions.
                </p>
              </CardContent>
            </Card>
            
            {/* Team Member 3 */}
            <Card>
              <CardContent className="text-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUserMd} className="text-gray-400 text-4xl" />
                </div>
                <CardTitle className="mb-1">Emily Rodriguez</CardTitle>
                <p className="text-blue-600 font-medium mb-2">Head of Patient Experience</p>
                <p className="text-gray-600">
                  Healthcare administrator focused on creating exceptional patient experiences and streamlining healthcare processes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
            <p className="mt-4 text-xl text-gray-600">Comprehensive healthcare solutions for patients and providers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Service 1 */}
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <FontAwesomeIcon icon={faUserMd} />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Doctor Appointment Booking</h3>
                <p className="text-gray-600">
                  Search for specialists, view available time slots, and book appointments with just a few clicks. Receive confirmation and reminders via email or SMS.
                </p>
              </div>
            </div>
            
            {/* Service 2 */}
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <FontAwesomeIcon icon={faClipboardCheck} />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Health Records Management</h3>
                <p className="text-gray-600">
                  Securely store and access your medical history, test results, prescriptions, and treatment plans in one centralized location.
                </p>
              </div>
            </div>
            
            {/* Service 3 */}
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <FontAwesomeIcon icon={faHeartbeat} />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Telemedicine Consultations</h3>
                <p className="text-gray-600">
                  Connect with healthcare providers remotely through secure video consultations for follow-ups, minor concerns, or when in-person visits aren't possible.
                </p>
              </div>
            </div>
            
            {/* Service 4 */}
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <FontAwesomeIcon icon={faShieldAlt} />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Provider Management System</h3>
                <p className="text-gray-600">
                  Healthcare providers can manage their schedules, patient appointments, and medical records efficiently through our integrated platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quality Assurance Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:space-x-12">
            <div className="md:w-1/2 mb-8 md:mb-0 order-2 md:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Quality & Security</h2>
              <p className="text-gray-600 mb-6">
                We prioritize the security and privacy of your health information. Our platform is built with industry-leading security measures and complies with healthcare data protection regulations.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-blue-500">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-600">End-to-end encryption for all patient data</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-blue-500">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-600">Compliance with healthcare data protection standards</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-blue-500">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-600">Regular security audits and vulnerability testing</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-blue-500">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-600">Strict access controls and user authentication</p>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 order-1 md:order-2">
              <div className="relative h-64 md:h-96 w-full rounded-lg bg-blue-100 flex items-center justify-center">
                {/* Placeholder for security image */}
                <FontAwesomeIcon icon={faShieldAlt} className="text-blue-500 text-6xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
