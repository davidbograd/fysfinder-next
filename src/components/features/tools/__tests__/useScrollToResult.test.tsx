import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { useScrollToResult } from "../useScrollToResult";

function Calculator() {
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);
  return (
    <>
      <button type="button" onClick={() => setResult((value) => (value ?? 0) + 1)}>
        Beregn
      </button>
      {result !== null && <div ref={resultRef}>Resultat {result}</div>}
    </>
  );
}

describe("useScrollToResult", () => {
  const scrollIntoView = jest.fn();

  beforeEach(() => {
    scrollIntoView.mockReset();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  it("scrolls the result into view every time a new result is calculated", async () => {
    const user = userEvent.setup();
    render(<Calculator />);
    expect(scrollIntoView).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Beregn" }));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: "start" })
    );

    await user.click(screen.getByRole("button", { name: "Beregn" }));
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
  });
});
