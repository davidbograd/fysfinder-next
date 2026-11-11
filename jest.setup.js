import '@testing-library/jest-dom';

// Updated: 2026-03-30 - Added stable shared mocks for router and browser APIs.
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();

global.__TEST_ROUTER_MOCKS__ = {
  push: mockPush,
  replace: mockReplace,
  prefetch: mockPrefetch,
};

beforeEach(() => {
  mockPush.mockReset();
  mockReplace.mockReset();
  mockPrefetch.mockReset();
});

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = MockIntersectionObserver;
global.ResizeObserver = MockResizeObserver;
global.matchMedia = jest.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: mockPush,
      replace: mockReplace,
      prefetch: mockPrefetch,
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Mock next/image for predictable test DOM output
jest.mock('next/image', () => {
  return function MockNextImage(props) {
    const { fill, priority, placeholder, blurDataURL, unoptimized, ...rest } = props;
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...rest} />;
  };
});

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>;
  };
}); 