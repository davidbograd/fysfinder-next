// Updated: 2026-11-11 - Front page fade wraps nav and content only on /.
import { render, screen } from "@testing-library/react";
import { HomeEnterFade } from "../HomeEnterFade";

describe("HomeEnterFade", () => {
  afterEach(() => {
    global.__TEST_PATHNAME__ = undefined;
  });

  it("fades the front page in as one piece", () => {
    global.__TEST_PATHNAME__ = "/";

    const { container } = render(
      <HomeEnterFade>
        <p>Nav</p>
        <p>Hero</p>
      </HomeEnterFade>
    );

    const fade = container.querySelector(".home-fade-in");
    expect(fade).toBeInTheDocument();
    expect(fade).toHaveTextContent("Nav");
    expect(fade).toHaveTextContent("Hero");
  });

  it("leaves other pages unwrapped", () => {
    global.__TEST_PATHNAME__ = "/blog";

    const { container } = render(
      <HomeEnterFade>
        <p>Article</p>
      </HomeEnterFade>
    );

    expect(container.querySelector(".home-fade-in")).not.toBeInTheDocument();
    expect(screen.getByText("Article")).toBeInTheDocument();
  });
});
