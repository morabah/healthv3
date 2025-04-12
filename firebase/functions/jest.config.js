/**
 * Jest configuration for Firebase Functions tests
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/__tests__/**/*.ts',
    '!src/index.ts',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov'],
  setupFiles: ['dotenv/config'],
  testTimeout: 30000, // Increased timeout for integration tests
  verbose: true,
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};
