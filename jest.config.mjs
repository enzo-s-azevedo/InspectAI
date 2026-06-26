import nextJest from 'next/jest.js';

const createNextConfig = nextJest({ dir: './' });

const backendConfig = {
  displayName: 'backend',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/tests/backend/**/*.test.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/tests/backend/usuarios.test.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/backend/node_modules/@prisma/client',
    '^@/lib/(.*)$': '<rootDir>/backend/src/lib/$1',
    '^@/app/(.*)$': '<rootDir>/backend/src/app/$1',
    '^@/(.*)$': '<rootDir>/backend/src/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>/backend/node_modules'],
};

const frontendConfig = await createNextConfig({
  displayName: 'frontend',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/tests/frontend/**/*.test.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
})();

// Projeto separado: usa o ambiente real do next/jest (com NextRequest/NextResponse reais)
// mas aponta para o middleware do backend
const middlewareConfig = await createNextConfig({
  displayName: 'middleware',
  setupFilesAfterEnv: [],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/backend/usuarios.test.js'],
  moduleNameMapper: {
    '^@/lib/(.*)$': '<rootDir>/backend/src/lib/$1',
    '^@/(.*)$': '<rootDir>/backend/src/$1',
  },
})();

export default {
  projects: [frontendConfig, backendConfig, middlewareConfig],
};
