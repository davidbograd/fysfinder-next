// Added: 2026-03-30 - Shared render helpers for consistent component tests.
import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";

function TestProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: TestProviders, ...options });
}
