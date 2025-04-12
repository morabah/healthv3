/**
 * Custom App Component
 * Wraps all pages with global providers and layout
 */

import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/Layout';
import { logInfo } from '../lib/logger';
import { trackPerformance } from '../lib/performance';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  // Track initial app load performance
  useEffect(() => {
    const perfTracker = trackPerformance('appInitialLoad', 'App');
    
    // Log app initialization
    logInfo({
      message: 'App initialized',
      context: 'App'
    });
    
    // Stop performance tracking when component mounts
    perfTracker.stop();
    
    // Clean up function
    return () => {
      logInfo({
        message: 'App unmounting',
        context: 'App'
      });
    };
  }, []);
  
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
