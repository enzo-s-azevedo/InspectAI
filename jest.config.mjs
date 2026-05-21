import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Ensina o Jest a encontrar seus arquivos quando você usa o atalho @/
    '^@/(.*)$': '<rootDir>/$1',
  }
};

export default createJestConfig(config);