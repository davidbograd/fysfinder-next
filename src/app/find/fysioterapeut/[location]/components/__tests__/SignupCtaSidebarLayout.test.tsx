// Tests for the section that pairs page content with the sticky clinic signup CTA.

import { render, screen } from "@testing-library/react";
import { SignupCtaSidebarLayout } from "../SignupCtaSidebarLayout";

describe("SignupCtaSidebarLayout", () => {
  it("renders the content alongside the signup CTA", () => {
    render(
      <SignupCtaSidebarLayout cityLocationPhrase="i Danmark">
        <p>SEO tekst om ydernummer</p>
      </SignupCtaSidebarLayout>
    );

    expect(screen.getByText("SEO tekst om ydernummer")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Driver du en klinik i Danmark?" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Tilmeld din klinik" })
    ).toHaveAttribute("href", "/tilmeld");
  });

  it("still shows the CTA when there is no content to sit beside", () => {
    render(<SignupCtaSidebarLayout cityLocationPhrase="i Danmark" />);

    expect(
      screen.getByRole("link", { name: "Tilmeld din klinik" })
    ).toBeInTheDocument();
  });
});
