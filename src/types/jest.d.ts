import "@testing-library/jest-dom";

declare global {
  var __TEST_ROUTER_MOCKS__: {
    push: jest.Mock;
    replace: jest.Mock;
    prefetch: jest.Mock;
  };

  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toHaveValue(value: string): R;
    }
  }
}
