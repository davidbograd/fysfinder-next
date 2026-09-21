import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  OpeningHoursEditor,
  findInvalidDays,
  isInvalidRange,
} from "../OpeningHoursEditor";
import type { OpeningHours } from "@/lib/opening-hours";

/** Radix Select needs these in jsdom. */
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
  window.HTMLElement.prototype.releasePointerCapture = jest.fn();
});

function Harness({ initial = {} }: { initial?: OpeningHours }) {
  const [value, setValue] = useState<OpeningHours>(initial);
  return (
    <>
      <OpeningHoursEditor value={value} onChange={setValue} />
      <output data-testid="state">{JSON.stringify(value)}</output>
    </>
  );
}

const state = (): OpeningHours =>
  JSON.parse(screen.getByTestId("state").textContent || "{}");

describe("OpeningHoursEditor", () => {
  it("shows existing hours as time inputs", () => {
    render(<Harness initial={{ mon: [{ open: "08:00", close: "18:00" }] }} />);

    expect(screen.getByLabelText("Mandag åbner")).toHaveValue("08:00");
    expect(screen.getByLabelText("Mandag lukker")).toHaveValue("18:00");
  });

  it("writes ISO times, so owners cannot invent a new format", () => {
    render(<Harness initial={{ mon: [{ open: "08:00", close: "18:00" }] }} />);

    fireEvent.change(screen.getByLabelText("Mandag lukker"), {
      target: { value: "16:30" },
    });

    expect(state().mon).toEqual([{ open: "08:00", close: "16:30" }]);
  });

  it("adds a second range for a lunch break", () => {
    render(<Harness initial={{ mon: [{ open: "08:00", close: "12:00" }] }} />);

    fireEvent.click(screen.getByText(/Tilføj tidsrum/));

    expect(state().mon).toHaveLength(2);
  });

  it("removes a range again", () => {
    render(
      <Harness
        initial={{
          mon: [
            { open: "08:00", close: "12:00" },
            { open: "13:00", close: "17:00" },
          ],
        }}
      />
    );

    fireEvent.click(screen.getAllByLabelText("Fjern tidsrum for Mandag")[0]);

    expect(state().mon).toEqual([{ open: "13:00", close: "17:00" }]);
  });

  it("copies Monday across the weekdays but leaves the weekend alone", () => {
    render(<Harness initial={{ mon: [{ open: "08:00", close: "18:00" }] }} />);

    fireEvent.click(screen.getByText("Kopiér mandag til alle hverdage"));

    const next = state();
    expect(next.fri).toEqual([{ open: "08:00", close: "18:00" }]);
    expect(next.sat).toBeUndefined();
  });

  it("cannot copy an unspecified Monday", () => {
    render(<Harness initial={{}} />);

    expect(screen.getByText("Kopiér mandag til alle hverdage")).toBeDisabled();
  });

  it("warns when a day closes before it opens", () => {
    render(<Harness initial={{ mon: [{ open: "18:00", close: "08:00" }] }} />);

    expect(
      screen.getByText("Lukketidspunktet skal være efter åbningstidspunktet.")
    ).toBeInTheDocument();
  });

  it("explains that unspecified days are not shown publicly", () => {
    render(<Harness initial={{}} />);

    expect(screen.getAllByText("Vises ikke på din klinikside.")).toHaveLength(7);
  });
});

describe("range validation helpers", () => {
  it("rejects a close time at or before the open time", () => {
    expect(isInvalidRange({ open: "08:00", close: "08:00" })).toBe(true);
    expect(isInvalidRange({ open: "18:00", close: "08:00" })).toBe(true);
    expect(isInvalidRange({ open: "08:00", close: "18:00" })).toBe(false);
  });

  it("lists every day with a broken range", () => {
    expect(
      findInvalidDays({
        mon: [{ open: "08:00", close: "18:00" }],
        wed: [{ open: "18:00", close: "08:00" }],
        fri: [],
      })
    ).toEqual(["wed"]);
  });
});
