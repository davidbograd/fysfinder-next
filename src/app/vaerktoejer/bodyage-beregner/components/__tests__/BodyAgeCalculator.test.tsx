import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BodyAgeCalculator } from "../BodyAgeCalculator";

async function fillProfile(
  user: ReturnType<typeof userEvent.setup>,
  { waist = "90", pulse = "65" } = {}
) {
  await user.click(screen.getByRole("button", { name: "Mand" }));
  await user.type(screen.getByLabelText("Alder"), "40");
  await user.type(screen.getByLabelText("Taljemål"), waist);
  await user.type(screen.getByLabelText("Hvilepuls"), pulse);
}

describe("BodyAgeCalculator", () => {
  it("shows the body age against the real age", async () => {
    const user = userEvent.setup();
    render(<BodyAgeCalculator />);

    await fillProfile(user);
    await user.click(
      screen.getByRole("button", { name: "Beregn din kropsalder" })
    );

    expect(screen.getByText("35 år")).toBeInTheDocument();
    expect(screen.getByText("5 år yngre end din alder")).toBeInTheDocument();
    expect(screen.getByText("48,5")).toBeInTheDocument();
  });

  it("hides intensity and duration for someone who rarely exercises and suggests starting", async () => {
    const user = userEvent.setup();
    render(<BodyAgeCalculator />);

    await fillProfile(user, { waist: "100", pulse: "75" });
    await user.selectOptions(
      screen.getByLabelText("Hvor ofte træner eller motionerer du?"),
      "sjaeldent"
    );
    expect(screen.queryByLabelText("Hvor hårdt træner du?")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Beregn din kropsalder" })
    );

    expect(screen.getByText("61 år")).toBeInTheDocument();
    expect(screen.getByText("Sådan bliver din krop yngre")).toBeInTheDocument();
    expect(screen.getByText(/Træn 2–3 gange om ugen/)).toBeInTheDocument();
  });

  it("names the missing measurements", async () => {
    const user = userEvent.setup();
    render(<BodyAgeCalculator />);

    await user.click(
      screen.getByRole("button", { name: "Beregn din kropsalder" })
    );

    expect(screen.getByText("Udfyld taljemål")).toBeInTheDocument();
    expect(screen.getByText("Udfyld hvilepuls")).toBeInTheDocument();
  });
});
