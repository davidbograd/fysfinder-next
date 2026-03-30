export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/src/test/mocks/fileMock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^github-slugger$': '<rootDir>/src/test/mocks/github-slugger.ts',
    '^@supabase/supabase-js$': '<rootDir>/src/test/mocks/supabase-js.ts',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
}; 