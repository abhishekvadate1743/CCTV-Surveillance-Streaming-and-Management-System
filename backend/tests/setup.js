/**
 * Test Setup File
 * 
 * This file runs before all tests and configures the test environment
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';

// Suppress console logs during tests (optional)
// Uncomment to reduce test output verbosity
// const originalLog = console.log;
// console.log = jest.fn();

// Configure test timeout
jest.setTimeout(30000);

// Setup error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Mock timers if needed (comment out if tests require real timers)
// jest.useFakeTimers();

export default async () => {
  console.log('Test environment configured');
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`MongoDB Test URI: ${process.env.MONGODB_TEST_URI || 'default'}`);
};
