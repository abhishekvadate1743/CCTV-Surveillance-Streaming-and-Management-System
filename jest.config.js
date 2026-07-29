export default {
  testEnvironment: 'node',
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  moduleDirectories: ['node_modules'],
  maxWorkers: 1,
  verbose: true,
  bail: false,
  detectOpenHandles: true,
  forceExit: true,
  testPathIgnorePatterns: ['/node_modules/', '/dist/']
};
