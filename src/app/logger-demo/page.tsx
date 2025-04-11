'use client';

import { useState } from 'react';
import { logInfo, logWarn, logError, logDebug } from '@/lib/logger';

// Mock appointment data for examples
const sampleAppointment = {
  id: 'appt-123',
  patientId: 'patient-456',
  doctorId: 'doctor-789',
  date: '2025-05-15',
  time: '14:30',
  status: 'pending',
  notes: 'Initial consultation'
};

export default function LoggerDemo() {
  const [results, setResults] = useState<string[]>([]);
  
  // Function to capture console output
  const captureLog = (callback: () => void) => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalDebug = console.debug;
    
    const logs: string[] = [];
    
    // Override console methods to capture output
    console.log = (message) => {
      logs.push(message);
      originalLog(message);
    };
    
    console.warn = (message) => {
      logs.push(message);
      originalWarn(message);
    };
    
    console.error = (message) => {
      logs.push(message);
      originalError(message);
    };
    
    console.debug = (message) => {
      logs.push(message);
      originalDebug(message);
    };
    
    // Execute the callback that will use the logging functions
    callback();
    
    // Restore original console methods
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    console.debug = originalDebug;
    
    return logs;
  };
  
  // Example 1: Logging function start/end
  const demoFunctionLogging = () => {
    const logs = captureLog(() => {
      logInfo({ 
        message: 'Starting appointment creation', 
        context: 'AppointmentService' 
      });
      
      // Function implementation would go here
      
      logInfo({ 
        message: 'Appointment created successfully', 
        context: 'AppointmentService',
        data: { appointmentId: sampleAppointment.id }
      });
    });
    
    setResults(logs);
  };
  
  // Example 2: Logging significant events
  const demoEventLogging = () => {
    const logs = captureLog(() => {
      logInfo({ 
        message: 'User logged in successfully', 
        context: 'AuthService',
        data: { userId: 'user-123' }
      });
    });
    
    setResults(logs);
  };
  
  // Example 3: Logging validation results
  const demoValidationLogging = () => {
    const logs = captureLog(() => {
      const errors = [];
      const data = { ...sampleAppointment, patientId: '' };
      
      if (!data.patientId) errors.push('Patient ID is required');
      if (!data.doctorId) errors.push('Doctor ID is required');
      if (!data.date) errors.push('Date is required');
      if (!data.time) errors.push('Time is required');
      
      if (errors.length > 0) {
        logWarn({ 
          message: 'Appointment validation failed', 
          context: 'Validation',
          data: { errors, appointmentData: data }
        });
      } else {
        logDebug({ 
          message: 'Appointment data validated successfully', 
          context: 'Validation',
          data
        });
      }
    });
    
    setResults(logs);
  };
  
  // Example 4: Logging errors
  const demoErrorLogging = () => {
    const logs = captureLog(() => {
      try {
        // Simulate an error
        throw new Error('Database connection failed');
      } catch (error) {
        logError({ 
          message: 'Failed to connect to database', 
          context: 'DatabaseService',
          data: { 
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
          }
        });
      }
    });
    
    setResults(logs);
  };
  
  // Example 5: Logging debug information
  const demoDebugLogging = () => {
    const logs = captureLog(() => {
      logDebug({ 
        message: 'Processing appointment request', 
        context: 'AppointmentService',
        data: sampleAppointment
      });
      
      // Note: This will only appear if NEXT_PUBLIC_LOG_LEVEL=debug
    });
    
    if (logs.length === 0) {
      setResults(['Debug logging is disabled. Set NEXT_PUBLIC_LOG_LEVEL=debug to see debug logs.']);
    } else {
      setResults(logs);
    }
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Logger Utility Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          onClick={demoFunctionLogging}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Demo: Function Start/End
        </button>
        
        <button 
          onClick={demoEventLogging}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Demo: Event Logging
        </button>
        
        <button 
          onClick={demoValidationLogging}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Demo: Validation Logging
        </button>
        
        <button 
          onClick={demoErrorLogging}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Demo: Error Logging
        </button>
        
        <button 
          onClick={demoDebugLogging}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Demo: Debug Logging
        </button>
      </div>
      
      <div className="border p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Console Output:</h2>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
          {results.length > 0 ? (
            results.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          ) : (
            <div>Click a button above to see logging output</div>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">How to Use the Logger:</h2>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`// Import the logging functions
import { logInfo, logWarn, logError, logDebug } from '@/lib/logger';

// Log information
logInfo({ 
  message: 'User logged in successfully',
  context: 'AuthService' // Optional context
});

// Log warnings
logWarn({ 
  message: 'Login attempt failed',
  context: 'AuthService',
  data: { userId: '123', attempts: 3 } // Optional data object
});

// Log errors
logError({ 
  message: 'Failed to create appointment',
  context: 'AppointmentService',
  data: { error: 'Database connection failed' }
});

// Log debug information (only shown when NEXT_PUBLIC_LOG_LEVEL=debug)
logDebug({ 
  message: 'Processing appointment request',
  context: 'AppointmentService',
  data: appointmentData
});`}
        </pre>
      </div>
    </div>
  );
}
