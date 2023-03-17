/* eslint filenames/match-exported:"off" -- trouble matching given period in filename */
// https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const jestConfig = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*-test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '#(.*)': '<rootDir>/node_modules/$1',
  },
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/test/'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

module.exports = jestConfig;
