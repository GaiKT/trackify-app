/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  roots: ['<rootDir>/src'], // Ensure Jest scans the correct directory
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(test).ts'], // Match test files
};

