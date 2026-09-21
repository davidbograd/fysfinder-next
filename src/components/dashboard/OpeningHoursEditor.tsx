"use client";

/**
 * Structured opening-hours editor for clinic owners.
 *
 * Replaces seven free-text inputs. Owners used to type whatever they liked, which is how
 * the database ended up holding "08.00–18.00", "08:00 – 17:00", "09:00-17:00" and "7-19"
 * side by side.
 *
 * Times are dropdowns rather than `<input type="time">` on purpose: the native control
 * renders in the browser's locale, so a visitor on an en-US machine gets an AM/PM picker.
 * Denmark never uses a 12-hour clock, so the value set is generated here instead.
 *
 * The stored type keeps three states per day, because "we don't know" and "closed" are
 * different facts and conflating them is what made ~800 clinics look permanently shut.
 * The owner never sees the third one: someone who has opened this form is telling us what
 * the week looks like, so every day is either open or closed. `toOwnerEditableHours`
 * resolves the unknowns on the way in.
 */

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DAY_KEYS,
  DAY_KEY_TO_DANISH_LABEL,
  type DayKey,
  type OpeningHours,
  type TimeRange,
} from "@/lib/opening-hours";
import { Copy, Plus, X } from "lucide-react";

type DayStatus = "open" | "closed";

const DEFAULT_RANGE: TimeRange = { open: "08:00", close: "16:00" };

const WEEKDAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri"];

/** What a clinic with no hours on record starts from when the owner opens the editor. */
export const DEFAULT_OPENING_HOURS: OpeningHours = {
  mon: [{ ...DEFAULT_RANGE }],
  tue: [{ ...DEFAULT_RANGE }],
  wed: [{ ...DEFAULT_RANGE }],
  thu: [{ ...DEFAULT_RANGE }],
  fri: [{ ...DEFAULT_RANGE }],
  sat: [],
  sun: [],
};

/**
 * Turns whatever is on record into something the binary editor can represent: a clinic with
 * nothing known starts from a normal Danish week, and any individual day we happen not to
 * know about becomes closed rather than a blank dropdown.
 */
export const toOwnerEditableHours = (
  hours: OpeningHours | null | undefined
): OpeningHours => {
  const base = hours && Object.keys(hours).length > 0 ? hours : DEFAULT_OPENING_HOURS;
  return Object.fromEntries(
    DAY_KEYS.map((day) => [day, base[day] ?? []])
  ) as OpeningHours;
};

const STEP_MINUTES = 15;

const pad = (n: number): string => String(n).padStart(2, "0");

/** 00:00 … 23:45 in quarter-hour steps. */
const TIME_OPTIONS: string[] = Array.from(
  { length: (24 * 60) / STEP_MINUTES },
  (_, i) => `${pad(Math.floor((i * STEP_MINUTES) / 60))}:${pad((i * STEP_MINUTES) % 60)}`
);

/** Closing at midnight is "24:00", which is not a valid opening time. */
const CLOSE_OPTIONS: string[] = [...TIME_OPTIONS.slice(1), "24:00"];

const DAY_END_MINUTES = 24 * 60;
/** A second slot on the same day is almost always the far side of a lunch break. */
const BREAK_MINUTES = 30;
const NEW_RANGE_MINUTES = 2 * 60;

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const toTime = (minutes: number): string =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/**
 * Picks up half an hour after the previous slot ends and runs for two hours, clamped so a
 * late finish cannot push the new slot past midnight.
 */
const nextRangeAfter = (previous: TimeRange | undefined): TimeRange => {
  if (!previous) return { ...DEFAULT_RANGE };

  const open = Math.min(
    toMinutes(previous.close) + BREAK_MINUTES,
    DAY_END_MINUTES - STEP_MINUTES
  );
  return {
    open: toTime(open),
    close: toTime(Math.min(open + NEW_RANGE_MINUTES, DAY_END_MINUTES)),
  };
};

/** A range is invalid when it does not move forward in time; overnight is not a real case here. */
export const isInvalidRange = (range: TimeRange): boolean =>
  Boolean(range.open) && Boolean(range.close) && range.close <= range.open;

export const findInvalidDays = (hours: OpeningHours): DayKey[] =>
  DAY_KEYS.filter((day) => (hours[day] ?? []).some(isInvalidRange));

const statusOf = (ranges: TimeRange[] | undefined): DayStatus =>
  ranges && ranges.length > 0 ? "open" : "closed";

const sameRanges = (a: TimeRange[] = [], b: TimeRange[] = []): boolean =>
  a.length === b.length &&
  a.every((range, i) => range.open === b[i].open && range.close === b[i].close);

/**
 * The weekdays start out identical, so offering the copy action straight away would be a
 * no-op. It appears once Monday diverges from another weekday, which is the only moment
 * it does anything.
 */
const canCopyMonday = (hours: OpeningHours): boolean =>
  WEEKDAYS.some((day) => day !== "mon" && !sameRanges(hours[day], hours.mon));

/**
 * Existing data can sit off the quarter-hour grid (Google reports 08:20 for some places),
 * so the current value is always selectable even when it is not a generated option.
 */
const optionsIncluding = (options: string[], value: string): string[] =>
  value && !options.includes(value)
    ? [...options, value].sort((a, b) => a.localeCompare(b))
    : options;

function TimeSelect({
  value,
  options,
  label,
  onChange,
}: {
  value: string;
  options: string[];
  label: string;
  onChange: (next: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="h-10 w-[5.5rem] rounded-full px-3">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {optionsIncluding(options, value).map((time) => (
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface OpeningHoursEditorProps {
  value: OpeningHours;
  onChange: (next: OpeningHours) => void;
}

export function OpeningHoursEditor({ value, onChange }: OpeningHoursEditorProps) {
  const invalidDays = new Set(findInvalidDays(value));

  const setDay = (day: DayKey, ranges: TimeRange[]) => {
    onChange({ ...value, [day]: ranges });
  };

  const setStatus = (day: DayKey, status: DayStatus) => {
    if (status === "closed") return setDay(day, []);
    setDay(day, value[day]?.length ? value[day] : [{ ...DEFAULT_RANGE }]);
  };

  const setTime = (
    day: DayKey,
    index: number,
    field: keyof TimeRange,
    time: string
  ) => {
    const ranges = [...(value[day] ?? [])];
    ranges[index] = { ...ranges[index], [field]: time };
    setDay(day, ranges);
  };

  const addRange = (day: DayKey) => {
    const ranges = value[day] ?? [];
    setDay(day, [...ranges, nextRangeAfter(ranges[ranges.length - 1])]);
  };

  const removeRange = (day: DayKey, index: number) => {
    setDay(
      day,
      (value[day] ?? []).filter((_, i) => i !== index)
    );
  };

  const copyMondayToWeekdays = () => {
    const monday = value.mon;
    if (monday === undefined) return;

    const next: OpeningHours = { ...value };
    for (const day of WEEKDAYS) {
      next[day] = monday.map((range) => ({ ...range }));
    }
    onChange(next);
  };

  return (
    <div className="space-y-5">
      {DAY_KEYS.map((day) => {
        const ranges = value[day];
        const status = statusOf(ranges);
        const hasError = invalidDays.has(day);

        return (
          <div key={day} className="space-y-3">
            <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-[6rem_9rem_1fr] sm:items-start">
              <Label htmlFor={`${day}-status`} className="pt-2.5 text-sm font-medium">
                {DAY_KEY_TO_DANISH_LABEL[day]}
              </Label>

              <Select
                value={status}
                onValueChange={(next) => setStatus(day, next as DayStatus)}
              >
                <SelectTrigger id={`${day}-status`} className="rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Åben</SelectItem>
                  <SelectItem value="closed">Lukket</SelectItem>
                </SelectContent>
              </Select>

              {status === "open" && (
                <div className="space-y-2">
                  {(ranges ?? []).map((range, index) => (
                    <div key={index} className="flex flex-wrap items-center gap-1.5">
                      <TimeSelect
                        value={range.open}
                        options={TIME_OPTIONS}
                        label={`${DAY_KEY_TO_DANISH_LABEL[day]} åbner`}
                        onChange={(next) => setTime(day, index, "open", next)}
                      />
                      <span className="text-gray-500">–</span>
                      <TimeSelect
                        value={range.close}
                        options={CLOSE_OPTIONS}
                        label={`${DAY_KEY_TO_DANISH_LABEL[day]} lukker`}
                        onChange={(next) => setTime(day, index, "close", next)}
                      />

                      {index === 0 ? (
                        <button
                          type="button"
                          onClick={() => addRange(day)}
                          className="ml-1 inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-beige"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Tilføj tidsrum
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeRange(day, index)}
                          aria-label={`Fjern tidsrum for ${DAY_KEY_TO_DANISH_LABEL[day]}`}
                          className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {hasError && (
                    <p className="text-xs text-red-600">
                      Lukketidspunktet skal være efter åbningstidspunktet.
                    </p>
                  )}
                </div>
              )}

            </div>

            {day === "mon" && canCopyMonday(value) && (
              <div className="sm:pl-[6.75rem]">
                <Button
                  type="button"
                  size="sm"
                  onClick={copyMondayToWeekdays}
                  className="rounded-full"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Kopiér mandag til alle hverdage
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
