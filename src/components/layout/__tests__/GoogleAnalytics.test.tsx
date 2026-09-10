// Updated: 2026-09-10 - gtag always loads; storage is granted unless the visitor declined cookies.

import { render, screen } from "@testing-library/react";
import {
  GA_MEASUREMENT_ID,
  getGtagBootstrapScript,
  GoogleAnalytics,
} from "../GoogleAnalytics";
import { COOKIE_CONSENT_COOKIE_NAME } from "@/lib/cookie-consent";

jest.mock("next/script", () => ({
  __esModule: true,
  default: ({
    src,
    id,
    children,
  }: {
    src?: string;
    id?: string;
    children?: string;
  }) => <div data-testid={id || src}>{children}</div>,
}));

describe("GoogleAnalytics", () => {
  it("loads gtag on the first visit before the banner is answered", () => {
    render(<GoogleAnalytics />);

    expect(screen.getByTestId("google-analytics")).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      )
    ).toBeInTheDocument();
  });

  it("defaults Consent Mode storage to granted and denies it only after an explicit decline", () => {
    const script = getGtagBootstrapScript(GA_MEASUREMENT_ID);

    expect(script).toContain("'consent', 'default'");
    expect(script).toContain('"analytics_storage":"granted"');
    expect(script).toContain(`'config', '${GA_MEASUREMENT_ID}'`);
    expect(script).toContain(`${COOKIE_CONSENT_COOKIE_NAME}=false`);
    expect(script).toContain("'consent', 'update'");
    expect(script).toContain('"analytics_storage":"denied"');
  });
});
