/**
 * Layout Component
 * Main layout wrapper that includes the Navbar and Footer
 */
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { logInfo } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Track performance of layout rendering
  const perfTracker = trackPerformance('layoutRender', 'Layout');
  
  // Log layout rendering
  logInfo({
    message: 'Rendering main layout',
    context: 'Layout'
  });
  
  // Stop performance tracking
  perfTracker.stop();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
