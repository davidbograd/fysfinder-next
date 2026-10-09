// Added: 2026-10-09 - Shared Mand/Kvinde selector used by every calculator that asks for gender.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToolGenderSelector } from "../ToolGenderSelector";

describe("ToolGenderSelector", () => {
  it("offers Mand and Kvinde and reports the chosen value", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<ToolGenderSelector value="" onChange={onChange} />);

    const group = screen.getByRole("group", { name: "Køn" });
    expect(group).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Kvinde" }));
    expect(onChange).toHaveBeenCalledWith("female");
  });

  it("marks the selected option and shows a missing-choice error", () => {
    render(
      <ToolGenderSelector value="male" onChange={() => {}} error="Vælg køn" />
    );

    expect(screen.getByRole("button", { name: "Mand" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Kvinde" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByText("Vælg køn")).toBeInTheDocument();
  });

  it("shows a check mark only on the selected option", () => {
    render(<ToolGenderSelector value="female" onChange={() => {}} />);

    const female = screen.getByRole("button", { name: "Kvinde" });
    const male = screen.getByRole("button", { name: "Mand" });
    expect(
      female.querySelector('[data-selected-check="visible"]')
    ).toBeInTheDocument();
    expect(
      male.querySelector('[data-selected-check="visible"]')
    ).not.toBeInTheDocument();
  });
});
