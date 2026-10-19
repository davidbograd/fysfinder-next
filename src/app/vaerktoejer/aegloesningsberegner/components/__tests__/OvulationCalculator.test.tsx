import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  addDays,
  formatDanishDayMonth,
  formatDanishDate,
  formatDanishDateRange,
  parseIsoDate,
  toIsoDate,
  todayIsoDate,
} from "@/lib/calculators/dates";
import { OvulationCalculator } from "../OvulationCalculator";

const today = parseIsoDate(todayIsoDate())!;

function setLastPeriod(daysAgo: number) {
  fireEvent.change(
    screen.getByLabelText("Første dag i din seneste menstruation"),
    { target: { value: toIsoDate(addDays(today, -daysAgo)) } }
  );
}

describe("OvulationCalculator", () => {
  it("shows the next ovulation, the fertile window and a due-date preview", async () => {
    const user = userEvent.setup();
    render(<OvulationCalculator />);

    // Cyklusdag 3 af 28: ægløsning om 12 dage
    setLastPeriod(2);
    await user.click(screen.getByRole("button", { name: "Beregn ægløsning" }));

    const ovulation = addDays(today, 12);
    expect(
      screen.getByText(formatDanishDayMonth(ovulation), {
        selector: "p",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Om 12 dage")).toBeInTheDocument();
    expect(
      screen.getAllByText(formatDanishDateRange(addDays(ovulation, -5), ovulation))
        .length
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(formatDanishDate(addDays(today, 278)), { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Beregn din termin" })).toHaveAttribute(
      "href",
      "/vaerktoejer/terminsberegner"
    );
    expect(screen.getByText("Dine næste cyklusser")).toBeInTheDocument();
  });

  it("tells the visitor when she is fertile today", async () => {
    const user = userEvent.setup();
    render(<OvulationCalculator />);

    setLastPeriod(11);
    await user.click(screen.getByRole("button", { name: "Beregn ægløsning" }));

    expect(
      screen.getByText(/Du er i dit frugtbare vindue nu/)
    ).toBeInTheDocument();
  });

  it("asks for the date before calculating", async () => {
    const user = userEvent.setup();
    render(<OvulationCalculator />);

    await user.click(screen.getByRole("button", { name: "Beregn ægløsning" }));

    expect(
      screen.getByText("Vælg første dag i din seneste menstruation")
    ).toBeInTheDocument();
  });
});
