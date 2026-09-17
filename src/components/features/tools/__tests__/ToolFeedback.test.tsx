import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToolFeedback } from "../ToolFeedback";
import { notifyToolCompleted } from "@/lib/tools/tool-completion";

const originalFetch = global.fetch;
let fetchMock: jest.Mock;

function lastRequestBody(callIndex = -1) {
  const calls = fetchMock.mock.calls;
  const call = calls.at(callIndex);
  return JSON.parse((call?.[1] as RequestInit).body as string);
}

beforeEach(() => {
  jest.useFakeTimers();
  window.localStorage.clear();
  fetchMock = jest.fn().mockResolvedValue({ ok: true });
  global.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  global.fetch = originalFetch;
});

function advancePastReveal() {
  act(() => {
    jest.advanceTimersByTime(2000);
  });
}

describe("ToolFeedback", () => {
  it("stays hidden until the tool reports a result", () => {
    render(<ToolFeedback toolSlug="bmi-beregner" />);

    advancePastReveal();
    expect(screen.queryByText("Hjalp BMI-beregneren dig?")).not.toBeInTheDocument();
  });

  it("ignores a completion signal from a different tool", () => {
    render(<ToolFeedback toolSlug="bmi-beregner" />);

    notifyToolCompleted("pace-beregner");
    advancePastReveal();

    expect(screen.queryByText("Hjalp BMI-beregneren dig?")).not.toBeInTheDocument();
  });

  it("asks for a star rating on the positive path and submits the chosen score", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ToolFeedback toolSlug="bmi-beregner" />);

    notifyToolCompleted("bmi-beregner");
    advancePastReveal();

    await user.click(screen.getByRole("button", { name: "Ja" }));

    expect(
      screen.getByText("Dejligt! Hvor mange stjerner vil du give?")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Giv 5 stjerner" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/tool-rating", expect.anything());
    expect(lastRequestBody()).toMatchObject({
      toolSlug: "bmi-beregner",
      sentiment: "up",
      rating: 5,
    });
    expect(await screen.findByText(/Tak for din vurdering/)).toBeInTheDocument();
  });

  it("asks what could be better on the negative path and never offers stars", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ToolFeedback toolSlug="bmi-beregner" />);

    notifyToolCompleted("bmi-beregner");
    advancePastReveal();

    await user.click(screen.getByRole("button", { name: "Nej" }));

    expect(screen.getByText("Hvad kunne være bedre?")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Giv \d stjerner?/ })
    ).not.toBeInTheDocument();

    // The negative sentiment is recorded before any text is written.
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(lastRequestBody()).toMatchObject({ sentiment: "down" });
    expect(lastRequestBody().rating).toBeUndefined();
  });

  it("sends the written feedback without a star rating", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ToolFeedback toolSlug="bmi-beregner" />);

    notifyToolCompleted("bmi-beregner");
    advancePastReveal();

    await user.click(screen.getByRole("button", { name: "Nej" }));
    await user.type(
      screen.getByLabelText("Hvad kunne være bedre?"),
      "Resultatet var svært at forstå"
    );
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() =>
      expect(lastRequestBody()).toMatchObject({
        sentiment: "down",
        feedbackText: "Resultatet var svært at forstå",
      })
    );
    expect(lastRequestBody().rating).toBeUndefined();
  });

  it("does not ask again once the visitor has rated the tool", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { unmount } = render(<ToolFeedback toolSlug="bmi-beregner" />);

    notifyToolCompleted("bmi-beregner");
    advancePastReveal();
    await user.click(screen.getByRole("button", { name: "Ja" }));
    await user.click(screen.getByRole("button", { name: "Giv 4 stjerner" }));
    await screen.findByText(/Tak for din vurdering/);
    unmount();

    render(<ToolFeedback toolSlug="bmi-beregner" />);
    notifyToolCompleted("bmi-beregner");
    advancePastReveal();

    expect(screen.queryByText("Hjalp BMI-beregneren dig?")).not.toBeInTheDocument();
  });

  it("reveals on mount for tools that signal completion by rendering", () => {
    render(<ToolFeedback toolSlug="mr-scanning" revealOn="mount" />);

    advancePastReveal();

    expect(screen.getByText("Hjalp MR-oversætteren dig?")).toBeInTheDocument();
  });

  it("names the tool in the question", () => {
    render(<ToolFeedback toolSlug="bmi-beregner" />);

    notifyToolCompleted("bmi-beregner");
    advancePastReveal();

    expect(screen.getByText("Hjalp BMI-beregneren dig?")).toBeInTheDocument();
  });
});
