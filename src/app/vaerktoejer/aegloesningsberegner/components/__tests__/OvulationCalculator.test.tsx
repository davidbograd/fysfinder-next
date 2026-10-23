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
  it("only asks for the last period and the cycle length", () => {
    render(<OvulationCalculator />);

    expect(screen.getByLabelText("Cykluslængde")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Lutealfase/)).not.toBeInTheDocument();
  });

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
    expect(
      screen.getByRole("link", { name: "Gem din oversigt - Download" }).getAttribute("href")
    ).toBe(
      `/api/og/resultat/aegloesning?aeg=${toIsoDate(ovulation)}&menst=${toIsoDate(addDays(today, 26))}`
    );
  });

  it("marks the five period days and the day after ovulation in the calendar", async () => {
    const user = userEvent.setup();
    render(<OvulationCalculator />);

    setLastPeriod(2);
    await user.click(screen.getByRole("button", { name: "Beregn ægløsning" }));

    const lastPeriod = addDays(today, -2);
    const dayAfterOvulation = addDays(today, 13);
    for (let day = 0; day < 5; day++) {
      expect(
        screen.getByText(
          `${formatDanishDayMonth(addDays(lastPeriod, day))}: din seneste menstruation`,
          { exact: false }
        )
      ).toBeInTheDocument();
    }
    expect(
      screen.queryByText(
        `${formatDanishDayMonth(addDays(lastPeriod, 5))}: din seneste menstruation`,
        { exact: false }
      )
    ).not.toBeInTheDocument();

    const nextPeriod = addDays(lastPeriod, 28);
    for (let day = 0; day < 5; day++) {
      expect(
        screen.getByText(
          `${formatDanishDayMonth(addDays(nextPeriod, day))}: forventet menstruation`,
          { exact: false }
        )
      ).toBeInTheDocument();
    }

    const selectedDay = screen.getByText(
      `${formatDanishDayMonth(lastPeriod)}: din seneste menstruation`,
      { exact: false }
    ).parentElement!;
    expect(selectedDay).toHaveClass("ring-rose-500");
    const secondDay = screen.getByText(
      `${formatDanishDayMonth(addDays(lastPeriod, 1))}: din seneste menstruation`,
      { exact: false }
    ).parentElement!;
    expect(secondDay).not.toHaveClass("ring-rose-500");
    expect(
      screen.getByText(`${formatDanishDayMonth(dayAfterOvulation)}: dagen efter ægløsning`, {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Menstruation")).toBeInTheDocument();
    expect(screen.getByText("Dagen efter ægløsning")).toBeInTheDocument();
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
