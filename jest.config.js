module.exports = {
  preset: 'react-native',
  setupFilesAfterSetup: ['./jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  // 支持 ESM 模块（Redux Toolkit 等）
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-navigation|@react-navigation|@reduxjs|redux-logger|immer)/)',
  ],
  // 添加模块别名支持
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
