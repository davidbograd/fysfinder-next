// Updated: 2026-08-29 - Verifies clinics without a loadable logo are omitted from the carousel.
import { fireEvent, render, screen } from "@testing-library/react";
import { SocialProofLogoMarquee } from "../SocialProofLogoMarquee";

describe("SocialProofLogoMarquee", () => {
  it("renders the default clinic-owner heading", () => {
    render(<SocialProofLogoMarquee />);

    expect(screen.getByText("De bruger allerede Fysfinder")).toBeInTheDocument();
  });

  it("renders a custom heading for the homepage", () => {
    render(
      <SocialProofLogoMarquee heading="Den nemme måde at finde en lokal fysioterapeut" />
    );

    expect(
      screen.getByText("Den nemme måde at finde en lokal fysioterapeut")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("De bruger allerede Fysfinder")
    ).not.toBeInTheDocument();
  });

  it("does not use a full-viewport breakout when embedded", () => {
    const { container } = render(<SocialProofLogoMarquee embedded />);
    const wrapper = container.firstElementChild;

    expect(wrapper).toBeTruthy();
    expect(wrapper?.className).not.toMatch(/\bw-dvw\b/);
    expect(wrapper?.className).not.toMatch(/left-1\/2/);
  });

  it("hides clinics when no logo provider token is available", () => {
    const previousToken = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;

    render(<SocialProofLogoMarquee />);

    expect(screen.queryByText("RygCenter Skjern")).not.toBeInTheDocument();
    expect(screen.queryByText("Copenhagen Physio")).not.toBeInTheDocument();

    process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY = previousToken;
  });

  it("hides a clinic after its logo fails to load", () => {
    const previousToken = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;
    process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY = "pk_test_token";

    render(<SocialProofLogoMarquee />);

    const rygcenterLogos = screen.getAllByAltText("RygCenter Skjern logo");
    expect(rygcenterLogos.length).toBeGreaterThan(0);
    fireEvent.error(rygcenterLogos[0]);

    expect(screen.queryByText("RygCenter Skjern")).not.toBeInTheDocument();

    const copenhagenLogos = screen.getAllByAltText("Copenhagen Physio logo");
    fireEvent.load(copenhagenLogos[0]);
    expect(screen.getAllByText("Copenhagen Physio").length).toBeGreaterThan(0);

    process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY = previousToken;
  });
});
