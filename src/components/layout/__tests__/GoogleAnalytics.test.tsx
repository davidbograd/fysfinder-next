// Updated: 2026-09-06 - Analytics scripts stay unloaded until consent is granted.

import { act, render, screen } from "@testing-library/react";
import { GoogleAnalytics } from "../GoogleAnalytics";
import { COOKIE_CONSENT_ACCEPTED_EVENT } from "@/lib/cookie-consent";

jest.mock("next/script", () => ({
  __esModule: true,
  default: ({ src, id }: { src?: string; id?: string }) => (
    <div data-testid={id || src} />
  ),
}));

describe("GoogleAnalytics", () => {
  beforeEach(() => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    });
  });

  it("does not load gtag before consent", () => {
    render(<GoogleAnalytics />);
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
  });

  it("loads gtag after the visitor accepts cookies", () => {
    render(<GoogleAnalytics />);

    act(() => {
      window.dispatchEvent(new Event(COOKIE_CONSENT_ACCEPTED_EVENT));
    });

    expect(screen.getByTestId("google-analytics")).toBeInTheDocument();
  });
});
