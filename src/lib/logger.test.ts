/**
 * Test file demonstrating usage of the logging utility
 * Run with: npx ts-node src/lib/logger.test.ts
 */

const logger = require('./logger');
const { logInfo, logWarn, logError, logDebug } = logger;

// Mock appointment data for examples
const appointmentData = {
  id: 'appt-123',
  patientId: 'patient-456',
  doctorId: 'doctor-789',
  date: '2025-05-15',
  time: '14:30',
  status: 'pending',
  notes: 'Initial consultation'
};

// Mock user data for examples
const userData = {
  id: 'user-123',
  email: 'patient@example.com',
  name: 'John Doe',
  role: 'patient'
};

/**
 * Example 1: Logging function start/end
 * Use case: Track when key functions or processes begin and end
 */
function createAppointment(data: typeof appointmentData) {
  logInfo({ 
    message: 'Starting appointment creation', 
    context: 'AppointmentService' 
  });
  
  // Function implementation would go here
  
  logInfo({ 
    message: 'Appointment created successfully', 
    context: 'AppointmentService',
    data: { appointmentId: data.id }
  });
  
  return { success: true, appointmentId: data.id };
}

/**
 * Example 2: Logging significant events
 * Use case: Record important application events
 */
function logUserLogin(userId: string) {
  logInfo({ 
    message: 'User logged in successfully', 
    context: 'AuthService',
    data: { userId }
  });
}

/**
 * Example 3: Logging validation results
 * Use case: Track input validation outcomes
 */
function validateAppointment(data: typeof appointmentData) {
  const errors = [];
  
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
    return { valid: false, errors };
  }
  
  logDebug({ 
    message: 'Appointment data validated successfully', 
    context: 'Validation',
    data
  });
  
  return { valid: true };
}

/**
 * Example 4: Logging errors
 * Use case: Record errors with detailed information
 */
function simulateError() {
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
}

/**
 * Example 5: Logging performance data
 * Use case: Track timing of operations
 */
async function fetchUserProfile(userId: string) {
  const startTime = Date.now();
  
  logDebug({ 
    message: 'Fetching user profile', 
    context: 'UserService',
    data: { userId }
  });
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const endTime = Date.now();
  
  logInfo({ 
    message: 'User profile fetched', 
    context: 'UserService',
    data: { 
      userId,
      durationMs: endTime - startTime
    }
  });
  
  return userData;
}

/**
 * Run all examples
 */
async function runExamples() {
  console.log('\n=== LOGGER UTILITY DEMONSTRATION ===\n');
  
  console.log('Example 1: Logging function start/end');
  createAppointment(appointmentData);
  
  console.log('\nExample 2: Logging significant events');
  logUserLogin('user-123');
  
  console.log('\nExample 3: Logging validation results');
  validateAppointment(appointmentData);
  validateAppointment({ ...appointmentData, patientId: '' });
  
  console.log('\nExample 4: Logging errors');
  simulateError();
  
  console.log('\nExample 5: Logging performance data');
  await fetchUserProfile('user-123');
  
  console.log('\n=== END OF DEMONSTRATION ===\n');
  
  console.log('Note: Debug logs will only appear if NEXT_PUBLIC_LOG_LEVEL=debug is set');
  console.log('To enable debug logs, run: NEXT_PUBLIC_LOG_LEVEL=debug npx ts-node src/lib/logger.test.ts');
}

// Run the examples
runExamples();
