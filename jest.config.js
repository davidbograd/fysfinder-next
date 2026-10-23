export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/src/test/mocks/fileMock.ts',
    '\\.(png|jpe?g|webp|avif|gif)$': '<rootDir>/src/test/mocks/imageMock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^lib/(.*)$': '<rootDir>/lib/$1',
    '^@supabase/supabase-js$': '<rootDir>/src/test/mocks/supabase-js.ts',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  // unified/hast ecosystem packages are ESM-only and must be transpiled.
  transformIgnorePatterns: [
    '/node_modules/(?!(unist-[^/]+|hast-[^/]+|hastscript|property-information|comma-separated-tokens|space-separated-tokens|devlop)/)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
}; 