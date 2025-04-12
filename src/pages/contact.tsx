/**
 * Contact Page
 * Contact information for the Health Appointment System
 */

import React from 'react';
import Head from 'next/head';
import { logInfo } from '../lib/logger';

export default function Contact() {
  // Log page visit
  React.useEffect(() => {
    logInfo({
      message: 'Contact page visited',
      context: 'ContactPage'
    });
  }, []);

  return (
    <>
      <Head>
        <title>Contact - Health Appointment System</title>
        <meta name="description" content="Contact the Health Appointment System team" />
      </Head>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          Contact Us
        </h1>
        
        <div className="card mb-8">
          <div className="card-body">
            <p className="text-lg mb-4">
              This is the Contact page of the Health Appointment System.
            </p>
            <p className="text-gray-600">
              Placeholder content for the Contact page. This will be replaced with actual contact information and a contact form.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
