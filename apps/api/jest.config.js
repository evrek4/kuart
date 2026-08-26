/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  moduleNameMapper: {
    '^@kuafor-art/(.*)$': '<rootDir>/../../packages/$1/src'
  },
  setupFiles: ['dotenv/config']
};
