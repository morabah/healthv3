'use client';

import { useState, useEffect } from 'react';
import { trackPerformance } from '@/lib/performance';

// Define the appointment type for better type safety
type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
};

/**
 * Custom hook that uses the performance tracker to measure render time
 */
const useTrackRender = (componentName: string) => {
  useEffect(() => {
    const tracker = trackPerformance(`${componentName} render`, 'RenderTime');
    
    // Use requestAnimationFrame to ensure we measure after the render is complete
    const frameId = requestAnimationFrame(() => {
      // Use setTimeout to ensure we're measuring after the browser has painted
      setTimeout(() => {
        tracker.stop();
      }, 0);
    });
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [componentName]);
};

/**
 * Example function that simulates a database operation
 */
const fetchAppointments = async (userId: string, filter?: string) => {
  // Track the performance of this operation
  const tracker = trackPerformance('fetchAppointments', 'DatabaseOperation');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate mock appointments on the fly
  const mockAppointments = Array.from({ length: 100 }, (_, i) => ({
    id: `appt-${i}`,
    patientId: `patient-${Math.floor(Math.random() * 10)}`,
    doctorId: `doctor-${Math.floor(Math.random() * 5)}`,
    date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: `${Math.floor(Math.random() * 8) + 9}:${Math.random() > 0.5 ? '30' : '00'}`,
    status: ['pending', 'confirmed', 'completed', 'cancelled'][Math.floor(Math.random() * 4)] as 'pending' | 'confirmed' | 'completed' | 'cancelled',
    notes: Math.random() > 0.7 ? 'Follow-up appointment' : 'Initial consultation'
  })) as Appointment[];
  
  // Filter appointments based on the provided filter
  let result = [...mockAppointments];
  
  if (filter) {
    result = result.filter(appt => appt.status === filter);
  }
  
  // Stop tracking and get the duration
  const duration = tracker.stop({
    userId,
    filter,
    resultCount: result.length
  });
  
  return {
    appointments: result,
    duration
  };
};

/**
 * Example function that simulates a complex calculation
 */
const calculateStatistics = (appointments: Appointment[]) => {
  const tracker = trackPerformance('calculateStatistics', 'Computation');
  
  // Simulate a complex calculation
  let i = 0;
  while (i < 1000000) i++;
  
  // Calculate some statistics
  const byStatus = appointments.reduce((acc, appt) => {
    acc[appt.status] = (acc[appt.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byDoctor = appointments.reduce((acc, appt) => {
    acc[appt.doctorId] = (acc[appt.doctorId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Stop tracking and return the result
  tracker.stop({
    appointmentCount: appointments.length,
    statusCount: Object.keys(byStatus).length,
    doctorCount: Object.keys(byDoctor).length
  });
  
  return {
    byStatus,
    byDoctor
  };
};

/**
 * Component that demonstrates the performance tracking utility
 */
export default function PerformanceDemo() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statistics, setStatistics] = useState<{
    byStatus: Record<string, number>;
    byDoctor: Record<string, number>;
  } | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  
  // Track the render time of this component
  useTrackRender('PerformanceDemo');
  
  // Function to load appointments with performance tracking
  const loadAppointments = async () => {
    setLoading(true);
    
    try {
      // Track the overall operation
      const overallTracker = trackPerformance('loadAppointmentsOperation', 'UserOperation');
      
      // Fetch appointments
      const result = await fetchAppointments('user-123', filter);
      setAppointments(result.appointments);
      
      // Calculate statistics
      const stats = calculateStatistics(result.appointments);
      setStatistics(stats);
      
      // Stop tracking the overall operation
      const overallDuration = overallTracker.stop({
        appointmentCount: result.appointments.length,
        filter
      });
      
      // Update durations
      setDurations(prev => ({
        ...prev,
        fetchDuration: result.duration,
        overallDuration
      }));
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to simulate a slow operation
  const simulateSlowOperation = () => {
    const tracker = trackPerformance('slowOperation', 'UserOperation');
    
    // Simulate a slow operation
    let result = 0;
    for (let i = 0; i < 10000000; i++) {
      result += Math.sqrt(i);
    }
    
    const duration = tracker.stop({
      result: result.toFixed(2)
    });
    
    setDurations(prev => ({
      ...prev,
      slowOperationDuration: duration
    }));
    
    return result;
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Performance Tracking Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          onClick={loadAppointments}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Loading...' : 'Load Appointments'}
        </button>
        
        <button 
          onClick={() => {
            const result = simulateSlowOperation();
            alert(`Slow operation completed with result: ${result.toFixed(2)}`);
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Simulate Slow Operation
        </button>
        
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Performance Metrics:</h2>
        <div className="bg-gray-100 p-4 rounded">
          {Object.entries(durations).map(([key, value]) => (
            <div key={key} className="mb-2">
              <span className="font-medium">{key}:</span> {value.toFixed(2)} ms
            </div>
          ))}
          {Object.keys(durations).length === 0 && (
            <div className="text-gray-500">No operations performed yet</div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Appointments ({appointments.length}):</h2>
          <div className="border rounded max-h-80 overflow-y-auto">
            {appointments.length > 0 ? (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 10).map((appt) => (
                    <tr key={appt.id} className="border-t">
                      <td className="px-4 py-2">{appt.id}</td>
                      <td className="px-4 py-2">{appt.date} {appt.time}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          appt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {appointments.length > 10 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-center text-gray-500">
                        ... and {appointments.length - 10} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No appointments loaded
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Statistics:</h2>
          <div className="border rounded p-4">
            {statistics ? (
              <>
                <div className="mb-4">
                  <h3 className="font-medium mb-2">By Status:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(statistics.byStatus).map(([status, count]) => (
                      <div key={status} className="bg-gray-50 p-2 rounded">
                        <span className="font-medium">{status}:</span> {count}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">By Doctor:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(statistics.byDoctor).map(([doctorId, count]) => (
                      <div key={doctorId} className="bg-gray-50 p-2 rounded">
                        <span className="font-medium">{doctorId}:</span> {count}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">
                No statistics calculated
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">How to Use the Performance Tracker:</h2>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`// Import the performance tracker
import { trackPerformance } from '@/lib/performance';

// Track a function execution
function fetchData() {
  const tracker = trackPerformance('fetchData', 'APIService');
  
  // Your code here...
  
  // Stop tracking and log the duration
  tracker.stop();
}

// Track with additional data
async function processItems(items) {
  const tracker = trackPerformance('processItems', 'DataProcessing');
  
  // Your code here...
  
  // Stop tracking with additional context data
  tracker.stop({
    itemCount: items.length,
    processingType: 'batch'
  });
}

// Track component render time with a custom hook
function useTrackRender(componentName) {
  useEffect(() => {
    const tracker = trackPerformance(\`\${componentName} render\`, 'RenderTime');
    
    // Use requestAnimationFrame for accurate timing after render
    const frameId = requestAnimationFrame(() => {
      setTimeout(() => {
        tracker.stop();
      }, 0);
    });
    
    return () => cancelAnimationFrame(frameId);
  }, [componentName]);
}`}
        </pre>
      </div>
    </div>
  );
}
