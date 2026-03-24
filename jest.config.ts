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
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'api-service.ts',
    'query-service.ts',
    'stub.ts',
    '<rootDir>/src/shared/shadcnComponent/ui/',
    'Loading\\.(ts|tsx)$',
    'index.ts',
    'Store.ts',
    'type.ts',
    'types.ts',
    '.*[cC]onfig\\.(js|ts|tsx)$',
  ],
  coverageThreshold: {
    global: {
      statements: 94,
      branches: 92,
      functions: 91,
      lines: 94,
    },
  },
};

export default createJestConfig(config);
