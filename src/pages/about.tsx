/**
 * About Page
 * Information about the Health Appointment System
 */

import React from 'react';
import Head from 'next/head';
import { logInfo } from '../lib/logger';

export default function About() {
  // Log page visit
  React.useEffect(() => {
    logInfo({
      message: 'About page visited',
      context: 'AboutPage'
    });
  }, []);

  return (
    <>
      <Head>
        <title>About - Health Appointment System</title>
        <meta name="description" content="Learn about the Health Appointment System" />
      </Head>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          About Health Appointment System
        </h1>
        
        <div className="card mb-8">
          <div className="card-body">
            <p className="text-lg mb-4">
              This is the About page of the Health Appointment System.
            </p>
            <p className="text-gray-600">
              Placeholder content for the About page. This will be replaced with actual information about the system, its features, and benefits.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
