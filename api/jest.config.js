// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'json', 'node'],
  testMatch: ['**/?(*.)+(spec|test).js'],
};