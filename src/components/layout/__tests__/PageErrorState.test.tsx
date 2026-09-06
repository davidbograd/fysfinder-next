import { fireEvent, render, screen } from "@testing-library/react";
import { PageErrorState } from "../PageErrorState";

describe("PageErrorState", () => {
  it("lets the visitor retry or go to the homepage", () => {
    const onRetry = jest.fn();
    render(<PageErrorState onRetry={onRetry} />);

    expect(
      screen.getByRole("heading", { name: "Noget gik galt" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Prøv igen" }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    expect(screen.getByRole("link", { name: "Gå til forsiden" })).toHaveAttribute(
      "href",
      "/"
    );
  });
});
