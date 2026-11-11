import "@testing-library/jest-dom";

declare global {
  var __TEST_ROUTER_MOCKS__: {
    push: jest.Mock;
    replace: jest.Mock;
    prefetch: jest.Mock;
  };

  var __TEST_PATHNAME__: string | undefined;

  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(...classNames: Array<string | RegExp>): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toHaveValue(value: string): R;
    }
  }
}
