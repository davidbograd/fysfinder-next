// Added: 2026-09-21 - Guards that calculator number fields only accept numbers.
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToolNumberField } from "../ToolNumberField";

function ControlledField({ allowDecimal = true }: { allowDecimal?: boolean }) {
  const [value, setValue] = useState("");
  return (
    <ToolNumberField
      id="test-field"
      label="Vægt"
      unit="kg"
      allowDecimal={allowDecimal}
      value={value}
      onChange={setValue}
    />
  );
}

describe("ToolNumberField", () => {
  it("ignores letters and symbols while the visitor types", async () => {
    const user = userEvent.setup();
    render(<ControlledField />);

    const field = screen.getByLabelText("Vægt");
    await user.type(field, "8kg0!");

    expect(field).toHaveValue("80");
  });

  it("accepts a Danish comma and normalizes a typed period to one", async () => {
    const user = userEvent.setup();
    render(<ControlledField />);

    const field = screen.getByLabelText("Vægt");
    await user.type(field, "82.5");

    expect(field).toHaveValue("82,5");
  });

  it("keeps only the first decimal separator", async () => {
    const user = userEvent.setup();
    render(<ControlledField />);

    const field = screen.getByLabelText("Vægt");
    await user.type(field, "82,5,7");

    expect(field).toHaveValue("82,57");
  });

  it("refuses decimals on fields that only take whole numbers", async () => {
    const user = userEvent.setup();
    render(<ControlledField allowDecimal={false} />);

    const field = screen.getByLabelText("Vægt");
    await user.type(field, "35,5");

    expect(field).toHaveValue("355");
  });
});
