/**
 * Integration test runner script that starts Firebase emulators before running tests
 * and shuts them down afterward
 */
const { spawn } = require('child_process');
const { join } = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.bright}${colors.blue}Starting Firebase Emulators...${colors.reset}`);

// Start Firebase emulators
const emulatorsProcess = spawn('firebase', ['emulators:start', '--only', 'auth,firestore,functions,storage'], {
  stdio: 'pipe',
  shell: true,
  cwd: join(__dirname, '../..') // Run from project root
});

let emulatorOutput = '';
let emulatorsStarted = false;
let testProcess = null;

// Handle emulator output
emulatorsProcess.stdout.on('data', (data) => {
  const output = data.toString();
  emulatorOutput += output;
  
  // Print emulator output
  process.stdout.write(`${colors.dim}[Emulators] ${output}${colors.reset}`);
  
  // Check if emulators are ready
  if (output.includes('All emulators ready') && !emulatorsStarted) {
    emulatorsStarted = true;
    console.log(`\n${colors.bright}${colors.green}Firebase Emulators are running!${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}Running integration tests...${colors.reset}\n`);
    
    // Run Jest tests for integration tests only
    testProcess = spawn('npx', ['jest', '--testMatch', '**/__tests__/integration/**/*.test.ts', '--runInBand', '--forceExit'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });
    
    testProcess.on('close', (code) => {
      console.log(`\n${colors.bright}${colors.blue}Integration tests completed with exit code ${code}${colors.reset}`);
      console.log(`${colors.bright}${colors.yellow}Shutting down emulators...${colors.reset}`);
      
      // Kill the emulators process
      emulatorsProcess.kill();
      process.exit(code);
    });
  }
});

emulatorsProcess.stderr.on('data', (data) => {
  process.stderr.write(`${colors.red}[Emulators Error] ${data.toString()}${colors.reset}`);
});

// Handle emulator process exit
emulatorsProcess.on('close', (code) => {
  if (!emulatorsStarted) {
    console.error(`${colors.bright}${colors.red}Failed to start Firebase emulators (exit code ${code})${colors.reset}`);
    console.error(`${colors.red}${emulatorOutput}${colors.reset}`);
    process.exit(1);
  }
});

// Handle script interruption
process.on('SIGINT', () => {
  console.log(`\n${colors.bright}${colors.yellow}Received SIGINT. Shutting down...${colors.reset}`);
  
  if (testProcess) {
    testProcess.kill();
  }
  
  emulatorsProcess.kill();
  process.exit(0);
});
