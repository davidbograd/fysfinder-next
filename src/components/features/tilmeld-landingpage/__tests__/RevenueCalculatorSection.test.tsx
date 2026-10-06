// Added: 2026-10-06 - Covers the tilmeld revenue calculator math and slider interaction.
import { fireEvent, render, screen } from "@testing-library/react";
import { RevenueCalculatorSection } from "../RevenueCalculatorSection";
import {
  APPOINTMENT_VALUE_DEFAULT,
  APPOINTMENT_VALUE_MAX,
  APPOINTMENT_VALUE_MIN,
  OPEN_SPOTS_DEFAULT,
  OPEN_SPOTS_MAX,
  OPEN_SPOTS_MIN,
  calculateRevenuePotential,
  formatDkk,
} from "../revenue-calculator";

describe("calculateRevenuePotential", () => {
  it("values each weekly open spot as one appointment", () => {
    expect(calculateRevenuePotential(3, 650)).toEqual({
      appointmentsPerMonth: 13,
      monthlyRevenue: 8450,
      yearlyRevenue: 101400,
    });
  });

  it("never returns negative revenue", () => {
    expect(calculateRevenuePotential(-2, 650).monthlyRevenue).toBe(0);
  });

  it("starts both sliders in the middle of their range", () => {
    expect(OPEN_SPOTS_DEFAULT).toBe((OPEN_SPOTS_MIN + OPEN_SPOTS_MAX) / 2);
    expect(APPOINTMENT_VALUE_DEFAULT).toBe(650);
    expect(APPOINTMENT_VALUE_DEFAULT).toBe(
      (APPOINTMENT_VALUE_MIN + APPOINTMENT_VALUE_MAX) / 2
    );
  });
});

describe("RevenueCalculatorSection", () => {
  it("shows the default estimate and updates when sliders move", () => {
    render(<RevenueCalculatorSection />);

    const monthly = screen.getByTestId("monthly-revenue");
    expect(monthly).toHaveTextContent(
      `${formatDkk(calculateRevenuePotential(15, 650).monthlyRevenue)} kr.`
    );

    fireEvent.change(
      screen.getByLabelText("Ledige tider i kalenderen pr. uge"),
      { target: { value: "6" } }
    );
    fireEvent.change(
      screen.getByLabelText("Gennemsnitlig værdi pr. behandling"),
      { target: { value: "800" } }
    );

    expect(monthly).toHaveTextContent(`${formatDkk(20800)} kr.`);
    expect(screen.getByTestId("yearly-revenue")).toHaveTextContent(
      `${formatDkk(249600)} kr.`
    );
  });
});
