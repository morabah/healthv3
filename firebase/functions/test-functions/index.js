const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Ultra simple test function
exports.simplePing = functions.https.onCall((data, context) => {
  console.log('Simple ping function called with data:', data);
  
  return {
    message: 'Pong!',
    receivedData: data
  };
});

// Simple user registration test function
exports.registerUserSimple = functions.https.onCall(async (data, context) => {
  try {
    console.log('Simple register user function called with data:', data);
    
    // Return mock success data without actually creating a user
    return {
      success: true,
      userId: 'mock-user-id-123',
      userType: data.userType || 'PATIENT',
      message: 'Registration simulated successfully without creating a real user'
    };
  } catch (error) {
    console.error('Error in simple register function:', error);
    throw new functions.https.HttpsError('internal', 'An error occurred during test registration');
  }
});
