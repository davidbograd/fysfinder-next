// Updated: 2026-08-30 - Adds coverage for the measured pixel scroll animation.
import { act, fireEvent, render, screen } from "@testing-library/react";
import { SocialProofLogoMarquee } from "../SocialProofLogoMarquee";
import { MARQUEE_SPEED_PX_PER_SECOND } from "../marquee-timing";

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

describe("SocialProofLogoMarquee scroll animation", () => {
  const LOOP_DISTANCE = 4424;
  const VIEWPORT_WIDTH = 390;

  let animate: jest.Mock;
  let previousToken: string | undefined;
  let previousAnimate: typeof Element.prototype.animate | undefined;

  function loadEveryLogo(container: HTMLElement) {
    container.querySelectorAll("img").forEach((image) => {
      fireEvent.load(image);
    });
  }

  function settleMeasurement() {
    act(() => {
      jest.advanceTimersByTime(500);
    });
  }

  beforeEach(() => {
    previousToken = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;
    process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY = "pk_test_token";

    jest.useFakeTimers();

    animate = jest.fn(() => ({ cancel: jest.fn() }));
    previousAnimate = Element.prototype.animate;
    Element.prototype.animate = animate as unknown as typeof Element.prototype.animate;

    // jsdom has no layout, so stand in for the two measurements the component takes.
    jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function mockRect(this: HTMLElement) {
        const left = this.dataset.marqueeCopy === "1" ? LOOP_DISTANCE : 0;
        return { left, x: left, width: 0, height: 0 } as DOMRect;
      });

    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get: () => VIEWPORT_WIDTH,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();

    if (previousAnimate) {
      Element.prototype.animate = previousAnimate;
    } else {
      Reflect.deleteProperty(Element.prototype, "animate");
    }

    Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
    process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY = previousToken;
  });

  it("scrolls by an absolute pixel offset rather than a percentage", () => {
    const { container } = render(<SocialProofLogoMarquee embedded />);

    loadEveryLogo(container);
    settleMeasurement();

    expect(animate).toHaveBeenCalled();

    const [keyframes] = animate.mock.calls.at(-1) as [Keyframe[]];

    expect(keyframes[0].transform).toBe("translate3d(0px, 0px, 0px)");
    expect(keyframes[1].transform).toBe(`translate3d(-${LOOP_DISTANCE}px, 0px, 0px)`);
    // A percentage offset here is what stopped the strip scrolling on iOS Safari.
    expect(keyframes[1].transform).not.toContain("%");
  });

  it("loops forever at the configured speed", () => {
    const { container } = render(<SocialProofLogoMarquee embedded />);

    loadEveryLogo(container);
    settleMeasurement();

    const [, options] = animate.mock.calls.at(-1) as [
      Keyframe[],
      KeyframeAnimationOptions,
    ];

    expect(options.duration).toBeCloseTo(
      (LOOP_DISTANCE / MARQUEE_SPEED_PX_PER_SECOND) * 1000
    );
    expect(options.iterations).toBe(Infinity);
    expect(options.easing).toBe("linear");
  });

  it("does not animate when the strip is narrower than the viewport", () => {
    jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function mockRect(this: HTMLElement) {
        const left = this.dataset.marqueeCopy === "1" ? 100 : 0;
        return { left, x: left, width: 0, height: 0 } as DOMRect;
      });

    const { container } = render(<SocialProofLogoMarquee embedded />);

    loadEveryLogo(container);
    settleMeasurement();

    expect(animate).not.toHaveBeenCalled();
  });

  it("stays still when the visitor prefers reduced motion", () => {
    jest.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
    } as unknown as MediaQueryList);

    const { container } = render(<SocialProofLogoMarquee embedded />);

    loadEveryLogo(container);
    settleMeasurement();

    expect(animate).not.toHaveBeenCalled();
  });
});
