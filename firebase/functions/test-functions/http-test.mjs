// Direct HTTP test for Firebase Functions

// Function to call the simplePing endpoint
async function testPingHttpDirect() {
  try {
    console.log('Testing simplePing function via direct HTTP...');
    
    const url = 'http://127.0.0.1:5002/health-appointment-system-dev/us-central1/simplePing';
    const data = {
      data: {
        name: 'Test User',
        message: 'This is a direct HTTP test'
      }
    };
    
    console.log('Sending request to:', url);
    console.log('With data:', data);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} - ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Direct HTTP test result:', result);
    
  } catch (error) {
    console.error('Error in direct HTTP test:', error);
  }
}

// Function to call the registerUserSimple endpoint
async function testRegisterHttpDirect() {
  try {
    console.log('Testing registerUserSimple function via direct HTTP...');
    
    const url = 'http://127.0.0.1:5002/health-appointment-system-dev/us-central1/registerUserSimple';
    const data = {
      data: {
        email: 'testuser@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        userType: 'PATIENT'
      }
    };
    
    console.log('Sending request to:', url);
    console.log('With data:', data);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} - ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Direct HTTP test result:', result);
    
  } catch (error) {
    console.error('Error in direct HTTP test:', error);
  }
}

// Run the direct HTTP tests
console.log('Starting direct HTTP tests...');

await testPingHttpDirect();
await testRegisterHttpDirect();

console.log('Direct HTTP tests completed');
