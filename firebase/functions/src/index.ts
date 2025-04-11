import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Example function to demonstrate Firebase Functions setup
export const helloWorld = functions.https.onCall((data, context) => {
  // Log function execution with timestamp for monitoring
  console.log(`helloWorld function executed at ${new Date().toISOString()}`);
  
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }
  
  // Track performance
  const startTime = performance.now();
  
  // Process the request
  const name = data.name || "World";
  const message = `Hello, ${name}!`;
  
  // Log performance metrics
  const endTime = performance.now();
  console.log(`helloWorld function completed in ${endTime - startTime}ms`);
  
  // Return the response
  return {
    message,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };
});

// Export other function groups when they are created
// export * from "./users";
// export * from "./appointments";
// export * from "./notifications";
