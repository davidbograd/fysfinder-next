import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  addDays,
  formatDanishDate,
  parseIsoDate,
  toIsoDate,
  todayIsoDate,
} from "@/lib/calculators/dates";
import { DueDateCalculator } from "../DueDateCalculator";

const today = parseIsoDate(todayIsoDate())!;

function primaryResult() {
  return within(screen.getByText("Din forventede terminsdato").closest("div")!);
}

function daysAgo(days: number): string {
  return toIsoDate(addDays(today, -days));
}

describe("DueDateCalculator", () => {
  it("shows the due date and the week of pregnancy from the last period", async () => {
    const user = userEvent.setup();
    render(<DueDateCalculator />);

    fireEvent.change(
      screen.getByLabelText("Første dag i din sidste menstruation"),
      { target: { value: daysAgo(87) } }
    );
    await user.click(screen.getByRole("button", { name: "Beregn termin" }));

    expect(
      primaryResult().getByText(formatDanishDate(addDays(today, 193)))
    ).toBeInTheDocument();
    expect(screen.getByText("12+3")).toBeInTheDocument();
    expect(screen.getByText("Du er i 13. uge")).toBeInTheDocument();
    expect(screen.getByText(/Nakkefoldsscanning/)).toBeInTheDocument();
  });

  it("adjusts for a long cycle and says so", async () => {
    const user = userEvent.setup();
    render(<DueDateCalculator />);

    fireEvent.change(
      screen.getByLabelText("Første dag i din sidste menstruation"),
      { target: { value: daysAgo(87) } }
    );
    await user.clear(screen.getByLabelText("Længde på din cyklus"));
    await user.type(screen.getByLabelText("Længde på din cyklus"), "35");
    await user.click(screen.getByRole("button", { name: "Beregn termin" }));

    expect(
      primaryResult().getByText(formatDanishDate(addDays(today, 200)))
    ).toBeInTheDocument();
    expect(screen.getByText(/flyttet 7 dage/)).toBeInTheDocument();
  });

  it("drops the cycle question for a known conception date", async () => {
    const user = userEvent.setup();
    render(<DueDateCalculator />);

    await user.click(screen.getByLabelText(/Undfangelse eller fertilitetsbehandling/));
    expect(screen.queryByLabelText("Længde på din cyklus")).not.toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Dato for undfangelse eller behandling"),
      { target: { value: daysAgo(73) } }
    );
    await user.click(screen.getByRole("button", { name: "Beregn termin" }));

    expect(
      primaryResult().getByText(formatDanishDate(addDays(today, 193)))
    ).toBeInTheDocument();
  });

  it("asks for the date and refuses one in the future", async () => {
    const user = userEvent.setup();
    render(<DueDateCalculator />);

    await user.click(screen.getByRole("button", { name: "Beregn termin" }));
    expect(screen.getByText("Vælg datoen")).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Første dag i din sidste menstruation"),
      { target: { value: daysAgo(-3) } }
    );
    await user.click(screen.getByRole("button", { name: "Beregn termin" }));
    expect(screen.getByRole("alert")).toHaveTextContent("fremtiden");
  });
});
