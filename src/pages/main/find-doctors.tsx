/**
 * Redirect from /main/find-doctors to /patient/find-doctors
 * This handles legacy URLs or incorrect navigation
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { logInfo } from '@/lib/logger';

export default function FindDoctorsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    logInfo({
      message: 'Redirecting from /main/find-doctors to /patient/find-doctors',
      context: 'FindDoctorsRedirect'
    });
    
    router.replace('/patient/find-doctors');
  }, [router]);
  
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Redirecting to Find Doctors...</p>
      </div>
    </div>
  );
}
