import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/tests/frontend/**/*.test.js'],
  testPathIgnorePatterns: ['<rootDir>/backend/'],
  moduleNameMapper: {
    // Ensina o Jest a encontrar seus arquivos quando você usa o atalho @/
    '^@/(.*)$': '<rootDir>/$1',
  }
};

export default createJestConfig(config);
