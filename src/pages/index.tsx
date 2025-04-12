/**
 * Homepage Component
 * Main landing page for the Health Appointment System
 */
import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserDoctor, 
  faCalendarCheck, 
  faFileMedical,
  faUserPlus,
  faSearch,
  faClipboardCheck,
  faHeartPulse
} from '@fortawesome/free-solid-svg-icons';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { logInfo } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';

const HomePage: NextPage = () => {
  // Track performance of page rendering
  const perfTracker = trackPerformance('pageRender', 'HomePage');
  
  // Log page visit
  logInfo({
    message: 'User visited homepage',
    context: 'HomePage'
  });
  
  // Stop performance tracking
  perfTracker.stop();
  
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Healthcare at Your Fingertips
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect with healthcare professionals, book appointments, and manage your health records all in one place.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/auth/register">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    rounded
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/about">
                  <Button 
                    variant="light" 
                    size="lg" 
                    rounded
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-lg h-80 md:h-96">
                {/* Placeholder for hero image */}
                <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon 
                    icon={faHeartPulse} 
                    className="text-blue-500 text-6xl" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how our platform can help you manage your healthcare needs efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card variant="elevated" hoverable>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <FontAwesomeIcon 
                      icon={faUserDoctor} 
                      className="text-blue-600 text-3xl" 
                    />
                  </div>
                </div>
                <CardTitle className="text-center">Find Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Search for healthcare professionals by specialty, location, or availability. Read reviews and make informed decisions.
                </CardDescription>
              </CardContent>
            </Card>
            
            {/* Feature 2 */}
            <Card variant="elevated" hoverable>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <FontAwesomeIcon 
                      icon={faCalendarCheck} 
                      className="text-blue-600 text-3xl" 
                    />
                  </div>
                </div>
                <CardTitle className="text-center">Book Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Schedule appointments with your preferred doctors at convenient times. Receive reminders and manage your bookings.
                </CardDescription>
              </CardContent>
            </Card>
            
            {/* Feature 3 */}
            <Card variant="elevated" hoverable>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <FontAwesomeIcon 
                      icon={faFileMedical} 
                      className="text-blue-600 text-3xl" 
                    />
                  </div>
                </div>
                <CardTitle className="text-center">Health Records</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Securely store and access your medical records, prescriptions, and test results. Share information with your healthcare providers.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started with our platform is simple and straightforward.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Register</h3>
              <div className="flex justify-center mb-4">
                <FontAwesomeIcon 
                  icon={faUserPlus} 
                  className="text-blue-600 text-3xl" 
                />
              </div>
              <p className="text-gray-600 text-center">
                Create your account and complete your profile with relevant health information.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Doctor</h3>
              <div className="flex justify-center mb-4">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="text-blue-600 text-3xl" 
                />
              </div>
              <p className="text-gray-600 text-center">
                Search for healthcare providers based on specialty, location, and availability.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Book Appointment</h3>
              <div className="flex justify-center mb-4">
                <FontAwesomeIcon 
                  icon={faCalendarCheck} 
                  className="text-blue-600 text-3xl" 
                />
              </div>
              <p className="text-gray-600 text-center">
                Select a convenient time slot and book your appointment with just a few clicks.
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Receive Care</h3>
              <div className="flex justify-center mb-4">
                <FontAwesomeIcon 
                  icon={faClipboardCheck} 
                  className="text-blue-600 text-3xl" 
                />
              </div>
              <p className="text-gray-600 text-center">
                Visit your doctor at the scheduled time and receive the care you need.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from patients and doctors who have used our platform.
            </p>
          </div>
          
          {/* Placeholder for testimonial carousel */}
          <div className="bg-gray-100 p-8 rounded-lg">
            <div className="max-w-3xl mx-auto">
              <div className="text-center">
                <p className="text-lg text-gray-700 italic mb-4">
                  "The Health Appointment System has made it so much easier for me to manage my appointments. I can find doctors, book appointments, and access my medical records all in one place."
                </p>
                <div className="font-semibold text-gray-900">Sarah Johnson</div>
                <div className="text-gray-600 text-sm">Patient</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Healthcare?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of users who have simplified their healthcare journey with our platform.
          </p>
          <Link href="/auth/register">
            <Button 
              variant="light" 
              size="lg" 
              rounded
            >
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;
