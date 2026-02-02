import type {Config} from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'api-service.ts',
    'query-service.ts',
    'stub.ts',
    '<rootDir>/src/shared/shadcnComponent/ui/',
  ],
};

export default createJestConfig(config);
