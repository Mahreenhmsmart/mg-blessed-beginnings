/**
 * Jest setup file for server tests.
 * Configure environment variables and global mocks here.
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test_db';

// Mock console.error to avoid noise in test output
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  // Filter out known warnings that are expected in tests
  const message = String(args[0]);
  if (message.includes('Mongoose') || message.includes('deprecation')) {
    return;
  }
  originalConsoleError.apply(console, args);
};
