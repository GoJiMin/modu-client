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
};

export default createJestConfig(config);
