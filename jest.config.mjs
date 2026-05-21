import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // 👇 ENSINANDO O JEST A LER O ATALHO @/
  moduleNameMapper: {
    '^@/(.*)$': ['<rootDir>/$1', '<rootDir>/src/$1'],
  },
}

export default createJestConfig(config)