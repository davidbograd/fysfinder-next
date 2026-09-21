import { useState } from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import {
  DEFAULT_OPENING_HOURS,
  OpeningHoursEditor,
  findInvalidDays,
  isInvalidRange,
  toOwnerEditableHours,
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

const openListbox = (label: string) => {
  fireEvent.click(screen.getByLabelText(label));
  return screen.getByRole("listbox");
};

describe("OpeningHoursEditor — 24-hour clock", () => {
  it("never offers AM or PM", () => {
    render(<Harness initial={{ mon: [{ open: "08:00", close: "16:00" }] }} />);

    const listbox = openListbox("Mandag åbner");

    expect(listbox.textContent).not.toMatch(/\b(AM|PM)\b/i);
    expect(within(listbox).getByText("13:00")).toBeInTheDocument();
  });

  it("offers quarter-hour steps across the full day", () => {
    render(<Harness initial={{ mon: [{ open: "08:00", close: "16:00" }] }} />);

    const listbox = openListbox("Mandag åbner");

    expect(within(listbox).getByText("00:00")).toBeInTheDocument();
    expect(within(listbox).getByText("08:15")).toBeInTheDocument();
    expect(within(listbox).getByText("23:45")).toBeInTheDocument();
  });

  it("keeps an off-grid time from Google selectable", () => {
    render(<Harness initial={{ mon: [{ open: "08:20", close: "16:00" }] }} />);

    const listbox = openListbox("Mandag åbner");

    expect(within(listbox).getByText("08:20")).toBeInTheDocument();
  });

  it("offers 24:00 as a closing time but never as an opening time", () => {
    render(<Harness initial={{ mon: [{ open: "08:00", close: "16:00" }] }} />);

    expect(within(openListbox("Mandag lukker")).getByText("24:00")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });

    expect(within(openListbox("Mandag åbner")).queryByText("24:00")).toBeNull();
  });
});

describe("OpeningHoursEditor — defaults", () => {
  it("starts open on weekdays and closed at the weekend", () => {
    expect(DEFAULT_OPENING_HOURS.mon).toEqual([{ open: "08:00", close: "16:00" }]);
    expect(DEFAULT_OPENING_HOURS.fri).toEqual([{ open: "08:00", close: "16:00" }]);
    expect(DEFAULT_OPENING_HOURS.sat).toEqual([]);
    expect(DEFAULT_OPENING_HOURS.sun).toEqual([]);
  });

  it("renders those defaults as five open days and two closed ones", () => {
    render(<Harness initial={DEFAULT_OPENING_HOURS} />);

    expect(screen.getAllByLabelText(/åbner$/)).toHaveLength(5);
    expect(screen.getAllByText("Lukket")).toHaveLength(2);
  });
});

describe("OpeningHoursEditor — editing", () => {
  it("writes ISO times, so owners cannot invent a new format", () => {
    render(<Harness initial={{ mon: [{ open: "08:00", close: "16:00" }] }} />);

    fireEvent.click(within(openListbox("Mandag lukker")).getByText("17:30"));

    expect(state().mon).toEqual([{ open: "08:00", close: "17:30" }]);
  });

  it("starts a second range half an hour after the first ends and runs it for two hours", () => {
    render(<Harness initial={{ mon: [{ open: "08:00", close: "12:00" }] }} />);

    fireEvent.click(screen.getByText("Tilføj tidsrum"));

    expect(state().mon).toEqual([
      { open: "08:00", close: "12:00" },
      { open: "12:30", close: "14:30" },
    ]);
  });

  it("chains a third range off the second", () => {
    render(<Harness initial={{ mon: [{ open: "08:00", close: "12:00" }] }} />);

    fireEvent.click(screen.getByText("Tilføj tidsrum"));
    fireEvent.click(screen.getByText("Tilføj tidsrum"));

    expect(state().mon?.[2]).toEqual({ open: "15:00", close: "17:00" });
  });

  it("never pushes a new range past midnight", () => {
    render(<Harness initial={{ mon: [{ open: "08:00", close: "23:00" }] }} />);

    fireEvent.click(screen.getByText("Tilføj tidsrum"));

    expect(state().mon?.[1]).toEqual({ open: "23:30", close: "24:00" });
  });

  it("keeps the new range valid even when the day already ends at 23:45", () => {
    render(<Harness initial={{ mon: [{ open: "08:00", close: "23:45" }] }} />);

    fireEvent.click(screen.getByText("Tilføj tidsrum"));

    expect(state().mon?.[1]).toEqual({ open: "23:45", close: "24:00" });
    expect(findInvalidDays(state())).toEqual([]);
  });

  it("offers add on the first range and remove on the extra ones", () => {
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

    expect(screen.getAllByText("Tilføj tidsrum")).toHaveLength(1);

    fireEvent.click(screen.getByLabelText("Fjern tidsrum for Mandag"));

    expect(state().mon).toEqual([{ open: "08:00", close: "12:00" }]);
  });

  it("switches a day to closed and back", () => {
    render(<Harness initial={DEFAULT_OPENING_HOURS} />);

    fireEvent.click(screen.getByLabelText("Mandag"));
    fireEvent.click(within(screen.getByRole("listbox")).getByText("Lukket"));
    expect(state().mon).toEqual([]);

    fireEvent.click(screen.getByLabelText("Mandag"));
    fireEvent.click(within(screen.getByRole("listbox")).getByText("Åben"));
    expect(state().mon).toEqual([{ open: "08:00", close: "16:00" }]);
  });
});

describe("OpeningHoursEditor — owner-facing status is binary", () => {
  it("offers only Åben and Lukket, never Ikke angivet", () => {
    render(<Harness initial={DEFAULT_OPENING_HOURS} />);

    const listbox = openListbox("Mandag");

    expect(within(listbox).getByText("Åben")).toBeInTheDocument();
    expect(within(listbox).getByText("Lukket")).toBeInTheDocument();
    expect(within(listbox).queryByText("Ikke angivet")).toBeNull();
  });

  it("shows a day we know nothing about as closed rather than a blank dropdown", () => {
    render(<Harness initial={toOwnerEditableHours({ mon: [{ open: "09:00", close: "17:00" }] })} />);

    expect(screen.getAllByText("Lukket")).toHaveLength(6);
  });
});

describe("toOwnerEditableHours", () => {
  it("falls back to the default week when nothing is on record", () => {
    expect(toOwnerEditableHours(null)).toEqual(DEFAULT_OPENING_HOURS);
    expect(toOwnerEditableHours({})).toEqual(DEFAULT_OPENING_HOURS);
  });

  it("resolves only the unknown days, leaving known ones untouched", () => {
    expect(toOwnerEditableHours({ mon: [{ open: "09:00", close: "17:00" }], tue: [] })).toEqual({
      mon: [{ open: "09:00", close: "17:00" }],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    });
  });

  it("keeps a genuinely all-closed week all closed", () => {
    const allClosed = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };

    expect(toOwnerEditableHours(allClosed)).toEqual(allClosed);
  });
});

describe("OpeningHoursEditor — copy Monday", () => {
  it("copies Monday across the weekdays but leaves the weekend alone", () => {
    render(
      <Harness initial={{ ...DEFAULT_OPENING_HOURS, mon: [{ open: "07:00", close: "19:00" }] }} />
    );

    fireEvent.click(screen.getByText("Kopiér mandag til alle hverdage"));

    const next = state();
    expect(next.tue).toEqual([{ open: "07:00", close: "19:00" }]);
    expect(next.fri).toEqual([{ open: "07:00", close: "19:00" }]);
    expect(next.sat).toEqual([]);
    expect(next.sun).toEqual([]);
  });

  it("copies split shifts too", () => {
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

    fireEvent.click(screen.getByText("Kopiér mandag til alle hverdage"));

    expect(state().wed).toHaveLength(2);
  });

  it("stays hidden while the weekdays already match, so it is never a no-op", () => {
    render(<Harness initial={DEFAULT_OPENING_HOURS} />);

    expect(screen.queryByText("Kopiér mandag til alle hverdage")).toBeNull();
  });

  it("stays hidden when the whole week is closed", () => {
    render(<Harness initial={{}} />);

    expect(screen.queryByText("Kopiér mandag til alle hverdage")).toBeNull();
  });

  it("appears as soon as Monday diverges and disappears once the copy lands", () => {
    render(<Harness initial={DEFAULT_OPENING_HOURS} />);

    fireEvent.click(within(openListbox("Mandag lukker")).getByText("19:00"));
    expect(screen.getByText("Kopiér mandag til alle hverdage")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Kopiér mandag til alle hverdage"));

    expect(state().tue).toEqual([{ open: "08:00", close: "19:00" }]);
    expect(screen.queryByText("Kopiér mandag til alle hverdage")).toBeNull();
  });

  it("appears when a weekday is closed but Monday is open", () => {
    render(<Harness initial={{ ...DEFAULT_OPENING_HOURS, wed: [] }} />);

    expect(screen.getByText("Kopiér mandag til alle hverdage")).toBeInTheDocument();
  });

  it("stays hidden when every weekday is closed", () => {
    render(
      <Harness initial={{ mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }} />
    );

    expect(screen.queryByText("Kopiér mandag til alle hverdage")).toBeNull();
  });

  it("ignores the weekend when deciding whether to appear", () => {
    render(<Harness initial={{ ...DEFAULT_OPENING_HOURS, sat: [{ open: "10:00", close: "14:00" }] }} />);

    expect(screen.queryByText("Kopiér mandag til alle hverdage")).toBeNull();
  });
});

describe("range validation helpers", () => {
  it("warns when a day closes before it opens", () => {
    render(<Harness initial={{ mon: [{ open: "18:00", close: "08:00" }] }} />);

    expect(
      screen.getByText("Lukketidspunktet skal være efter åbningstidspunktet.")
    ).toBeInTheDocument();
  });

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
