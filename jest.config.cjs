const path = require('path');

module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests/js'],
  testMatch: ['**/*.test.jsx'],
  transform: {
    '^.+\\.jsx?$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      },
    ],
  },
  moduleNameMapper: {
    '^ol/ol\\.css$': '<rootDir>/tests/js/styleMock.cjs',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  collectCoverageFrom: [
    'src/lib/components/Map.react.js',
    'src/lib/components/TileLayer.react.js',
    'src/lib/components/VectorLayer.react.js',
  ],
  coverageThreshold: {
    [path.join(__dirname, 'src/lib/components/Map.react.js')]: { statements: 80 },
    [path.join(__dirname, 'src/lib/components/TileLayer.react.js')]: { statements: 80 },
    [path.join(__dirname, 'src/lib/components/VectorLayer.react.js')]: { statements: 80 },
  },
  coverageReporters: ['text', 'lcov'],
};
