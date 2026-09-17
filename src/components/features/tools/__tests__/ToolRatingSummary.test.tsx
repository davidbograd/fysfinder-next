import { render, screen } from "@testing-library/react";
import { ToolRatingSummary } from "../ToolRatingSummary";
import { resolvePublishedToolRating } from "@/lib/tools/tool-ratings";

describe("ToolRatingSummary", () => {
  it("shows the rating a calculator publishes, formatted for Danish", () => {
    render(
      <ToolRatingSummary rating={resolvePublishedToolRating("bmi-beregner")} />
    );

    expect(screen.getByText("4,8")).toBeInTheDocument();
    expect(screen.getByText("(150 anmeldelser)")).toBeInTheDocument();
  });

  it("moves with real ratings so the display matches the markup", () => {
    render(
      <ToolRatingSummary
        rating={resolvePublishedToolRating("bmi-beregner", {
          ratingCount: 150,
          ratingSum: 750,
        })}
      />
    );

    expect(screen.getByText("4,9")).toBeInTheDocument();
    expect(screen.getByText("(300 anmeldelser)")).toBeInTheDocument();
  });

  it("renders nothing for a tool that publishes no rating", () => {
    const { container } = render(
      <ToolRatingSummary rating={resolvePublishedToolRating("mr-scanning")} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
