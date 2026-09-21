"use client";

/**
 * Structured opening-hours editor for clinic owners.
 *
 * Replaces seven free-text inputs. Owners used to type whatever they liked, which is how
 * the database ended up holding "08.00–18.00", "08:00 – 17:00", "09:00-17:00" and "7-19"
 * side by side. Time inputs mean the value is always ISO HH:MM before it is saved.
 *
 * The three-way status per day matters: "Ikke angivet" and "Lukket" are different facts,
 * and collapsing them is what made ~800 clinics look permanently shut.
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
import { Plus, X } from "lucide-react";

type DayStatus = "unspecified" | "open" | "closed";

const DEFAULT_RANGE: TimeRange = { open: "08:00", close: "16:00" };

const WEEKDAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri"];

const statusOf = (ranges: TimeRange[] | undefined): DayStatus => {
  if (ranges === undefined) return "unspecified";
  if (ranges.length === 0) return "closed";
  return "open";
};

/** A range is invalid when it does not move forward in time; overnight is not a real case here. */
export const isInvalidRange = (range: TimeRange): boolean =>
  Boolean(range.open) && Boolean(range.close) && range.close <= range.open;

export const findInvalidDays = (hours: OpeningHours): DayKey[] =>
  DAY_KEYS.filter((day) => (hours[day] ?? []).some(isInvalidRange));

interface OpeningHoursEditorProps {
  value: OpeningHours;
  onChange: (next: OpeningHours) => void;
}

export function OpeningHoursEditor({ value, onChange }: OpeningHoursEditorProps) {
  const invalidDays = new Set(findInvalidDays(value));

  const setDay = (day: DayKey, ranges: TimeRange[] | undefined) => {
    const next: OpeningHours = { ...value };
    if (ranges === undefined) {
      delete next[day];
    } else {
      next[day] = ranges;
    }
    onChange(next);
  };

  const setStatus = (day: DayKey, status: DayStatus) => {
    if (status === "unspecified") return setDay(day, undefined);
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
    setDay(day, [...(value[day] ?? []), { ...DEFAULT_RANGE }]);
  };

  const removeRange = (day: DayKey, index: number) => {
    const ranges = (value[day] ?? []).filter((_, i) => i !== index);
    setDay(day, ranges.length > 0 ? ranges : []);
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
    <div className="space-y-4">
      <div className="space-y-4">
        {DAY_KEYS.map((day) => {
          const ranges = value[day];
          const status = statusOf(ranges);
          const hasError = invalidDays.has(day);

          return (
            <div
              key={day}
              className="grid grid-cols-1 gap-3 sm:grid-cols-[7rem_10rem_1fr] sm:items-start"
            >
              <Label
                htmlFor={`${day}-status`}
                className="pt-2 text-sm font-medium"
              >
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
                  <SelectItem value="unspecified">Ikke angivet</SelectItem>
                </SelectContent>
              </Select>

              {status === "open" && (
                <div className="space-y-2">
                  {(ranges ?? []).map((range, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        aria-label={`${DAY_KEY_TO_DANISH_LABEL[day]} åbner`}
                        value={range.open}
                        onChange={(e) => setTime(day, index, "open", e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                      <span className="text-gray-500">–</span>
                      <input
                        type="time"
                        aria-label={`${DAY_KEY_TO_DANISH_LABEL[day]} lukker`}
                        value={range.close}
                        onChange={(e) => setTime(day, index, "close", e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                      {(ranges ?? []).length > 1 && (
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

                  <button
                    type="button"
                    onClick={() => addRange(day)}
                    className="inline-flex items-center gap-1 text-xs text-brand-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    Tilføj tidsrum (fx frokostlukket)
                  </button>
                </div>
              )}

              {status === "unspecified" && (
                <p className="pt-2 text-xs text-gray-500">
                  Vises ikke på din klinikside.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={copyMondayToWeekdays}
        disabled={value.mon === undefined}
        className="rounded-full"
      >
        Kopiér mandag til alle hverdage
      </Button>
    </div>
  );
}
