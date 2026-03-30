// Added: 2026-03-30 - MVP interaction test for calorie calculator result flow.
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalorieCalculator } from "../CalorieCalculator";

describe("CalorieCalculator", () => {
  it("calculates and renders results for valid inputs", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<CalorieCalculator />);

    await user.type(screen.getByLabelText("Vægt (kg)"), "70");
    await user.type(screen.getByLabelText("Højde (cm)"), "175");
    await user.type(screen.getByLabelText("Alder (år)"), "30");
    await user.click(screen.getByRole("button", { name: "Mand" }));

    await user.click(screen.getByRole("button", { name: "Beregn kalorier" }));

    act(() => {
      jest.advanceTimersByTime(550);
    });

    expect(screen.getByText("Dine resultater")).toBeInTheDocument();
    expect(screen.getAllByText(/kcal\/dag/).length).toBeGreaterThan(0);
    jest.useRealTimers();
  });
});
