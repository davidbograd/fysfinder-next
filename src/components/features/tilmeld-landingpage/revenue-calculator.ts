// Added: 2026-10-06 - Pure math for the tilmeld revenue calculator.

export const WEEKS_PER_YEAR = 52;
export const WEEKS_PER_MONTH = WEEKS_PER_YEAR / 12;

export const OPEN_SPOTS_DEFAULT = 15;
export const OPEN_SPOTS_MIN = 0;
export const OPEN_SPOTS_MAX = 30;

export const APPOINTMENT_VALUE_DEFAULT = 650;
export const APPOINTMENT_VALUE_MIN = 100;
export const APPOINTMENT_VALUE_MAX = 1200;
export const APPOINTMENT_VALUE_STEP = 50;

export interface RevenuePotential {
  appointmentsPerMonth: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

export function calculateRevenuePotential(
  openSpotsPerWeek: number,
  appointmentValue: number
): RevenuePotential {
  const spots = Math.max(0, openSpotsPerWeek);
  const value = Math.max(0, appointmentValue);

  return {
    appointmentsPerMonth: Math.round(spots * WEEKS_PER_MONTH),
    monthlyRevenue: Math.round(spots * WEEKS_PER_MONTH * value),
    yearlyRevenue: Math.round(spots * WEEKS_PER_YEAR * value),
  };
}

export function formatDkk(amount: number): string {
  return new Intl.NumberFormat("da-DK", { maximumFractionDigits: 0 }).format(
    amount
  );
}
