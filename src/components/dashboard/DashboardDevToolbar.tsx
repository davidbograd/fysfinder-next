// Dev-only floating toolbar for switching dashboard data states.
// Uses URL search params so the server component can read the active state.

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const DEV_STATE_PARAM = "dev_state";

const STATE_OPTIONS = [
  { value: "", label: "Live data" },
  { value: "empty", label: "Empty state (no clinics)" },
] as const;

export function DashboardDevToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (process.env.NODE_ENV === "production" || !searchParams) return null;

  const currentState = searchParams.get(DEV_STATE_PARAM) ?? "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const value = e.target.value;
    if (value) {
      params.set(DEV_STATE_PARAM, value);
    } else {
      params.delete(DEV_STATE_PARAM);
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-lg">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
        Dev state
      </span>
      <select
        value={currentState}
        onChange={handleChange}
        aria-label="Select dashboard data state"
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {STATE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
