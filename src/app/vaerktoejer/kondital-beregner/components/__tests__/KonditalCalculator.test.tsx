// Added: 2026-09-21 - Interaction tests for the kondital calculator's two methods.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KonditalCalculator } from "../KonditalCalculator";

describe("KonditalCalculator", () => {
  it("points at the empty fields instead of blocking the button", async () => {
    const user = userEvent.setup();
    render(<KonditalCalculator />);

    const submit = screen.getByRole("button", { name: "Beregn kondital" });
    expect(submit).toBeEnabled();

    await user.click(submit);

    expect(screen.getByText("Vælg køn")).toBeInTheDocument();
    expect(screen.getByText("Udfyld alder")).toBeInTheDocument();
    expect(screen.getByText("Udfyld hvilepuls")).toBeInTheDocument();
    expect(screen.queryByText("Dit resultat")).not.toBeInTheDocument();

    // Answering a field clears its own message without touching the others.
    await user.click(screen.getByRole("button", { name: "Mand" }));
    expect(screen.queryByText("Vælg køn")).not.toBeInTheDocument();
    expect(screen.getByText("Udfyld alder")).toBeInTheDocument();
  });

  it("asks for the Cooper distance rather than the resting pulse on that method", async () => {
    const user = userEvent.setup();
    render(<KonditalCalculator />);

    await user.click(screen.getByRole("radio", { name: /Cooper-testen/ }));
    await user.click(screen.getByRole("button", { name: "Beregn kondital" }));

    expect(
      screen.getByText("Udfyld distance på 12 minutter")
    ).toBeInTheDocument();
    expect(screen.queryByText("Udfyld hvilepuls")).not.toBeInTheDocument();
  });

  it("calculates from the resting pulse and shows the bands for the visitor's age group", async () => {
    const user = userEvent.setup();
    render(<KonditalCalculator />);

    await user.click(screen.getByRole("button", { name: "Mand" }));
    await user.type(screen.getByLabelText("Alder"), "35");
    await user.type(screen.getByLabelText("Hvilepuls"), "58");
    await user.click(screen.getByRole("button", { name: "Beregn kondital" }));

    // The classification sits on the number itself, and again in the table.
    const primaryResult = screen.getByText("Dit kondital").closest("div")!;
    expect(within(primaryResult).getByText("48,5")).toBeInTheDocument();
    expect(within(primaryResult).getByText("Meget god")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Sådan ligger dit kondital (30-39 år)" })
    ).toBeInTheDocument();

    // The max pulse was not measured, so the visitor is told it is an estimate.
    expect(screen.getByText("184 slag/min")).toBeInTheDocument();
    expect(screen.getByText("Estimeret ud fra din alder")).toBeInTheDocument();
  });

  it("repeats the numbers it calculated on, including the method's own field", async () => {
    const user = userEvent.setup();
    render(<KonditalCalculator />);

    await user.click(screen.getByRole("button", { name: "Kvinde" }));
    await user.type(screen.getByLabelText("Alder"), "42");
    await user.type(screen.getByLabelText("Hvilepuls"), "62");
    await user.type(screen.getByLabelText(/Vægt/), "64,5");
    await user.click(screen.getByRole("button", { name: "Beregn kondital" }));

    expect(
      screen.getByText("42-årig kvinde · hvilepuls 62 · 64,5 kg")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /Cooper-testen/ }));
    await user.type(screen.getByLabelText("Distance på 12 minutter"), "2200");
    await user.click(screen.getByRole("button", { name: "Beregn kondital" }));

    expect(
      screen.getByText("42-årig kvinde · 2.200 m på 12 min · 64,5 kg")
    ).toBeInTheDocument();
  });

  it("swaps the fields and drops the old result when the Cooper test is picked", async () => {
    const user = userEvent.setup();
    render(<KonditalCalculator />);

    await user.click(screen.getByRole("button", { name: "Mand" }));
    await user.type(screen.getByLabelText("Alder"), "35");
    await user.type(screen.getByLabelText("Hvilepuls"), "58");
    await user.click(screen.getByRole("button", { name: "Beregn kondital" }));
    expect(screen.getByText("48,5")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /Cooper-testen/ }));

    expect(screen.queryByText("48,5")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Hvilepuls")).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Distance på 12 minutter")
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Distance på 12 minutter"), "2600");
    await user.click(screen.getByRole("button", { name: "Beregn kondital" }));

    expect(screen.getByText("46,8")).toBeInTheDocument();
  });

  it("explains itself instead of showing a number when the resting pulse is implausible", async () => {
    const user = userEvent.setup();
    render(<KonditalCalculator />);

    await user.click(screen.getByRole("button", { name: "Mand" }));
    await user.type(screen.getByLabelText("Alder"), "35");
    await user.type(screen.getByLabelText("Hvilepuls"), "180");
    await user.click(screen.getByRole("button", { name: "Beregn kondital" }));

    expect(
      screen.getByText("Indtast en hvilepuls mellem 30 og 120 slag i minuttet.")
    ).toBeInTheDocument();
  });

  it("never asks for a max pulse, and links to a video on counting the resting one", () => {
    render(<KonditalCalculator />);

    expect(screen.queryByLabelText(/Makspuls/)).not.toBeInTheDocument();

    const video = screen.getByRole("link", { name: /Se hvordan du tæller pulsen/ });
    expect(video).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=BSlRvD-CZSo"
    );
    expect(video).toHaveAttribute("target", "_blank");
    expect(video).toHaveAttribute("rel", "noopener noreferrer");
  });
});
