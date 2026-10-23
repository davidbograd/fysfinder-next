// Delbart billede fra makroberegneren.
//
// Billedet viser kun kaloriemålet og makroerne – aldrig alder, vægt eller højde.

import type { Macro, MacroSuccess } from "@/lib/calculators/macros";

export const MACRO_SHARE_PATH = "/api/og/makro";

export const MACRO_SHARE_ORDER: Macro[] = ["protein", "carbs", "fat"];

const PARAM: Record<Macro, string> = {
  protein: "protein",
  carbs: "kulhydrat",
  fat: "fedt",
};

export interface MacroShareContent {
  kcalPerDay: number;
  macros: Record<Macro, { grams: number; pct: number }>;
}

export function buildMacroShareUrl(result: MacroSuccess): string {
  const params = new URLSearchParams({ kcal: String(result.kcalPerDay) });
  for (const macro of MACRO_SHARE_ORDER) {
    const { grams, pct } = result.macros[macro];
    params.set(PARAM[macro], `${grams}-${pct}`);
  }
  return `${MACRO_SHARE_PATH}?${params.toString()}`;
}

function parseAmount(value: string | null): { grams: number; pct: number } | null {
  const match = /^(\d{1,4})-(\d{1,3})$/.exec(value ?? "");
  if (!match) return null;
  const grams = Number(match[1]);
  const pct = Number(match[2]);
  return pct <= 100 ? { grams, pct } : null;
}

export function parseMacroShareParams(
  searchParams: URLSearchParams
): MacroShareContent | null {
  const rawKcal = searchParams.get("kcal") ?? "";
  if (!/^\d{3,5}$/.test(rawKcal)) return null;
  const kcalPerDay = Number(rawKcal);
  if (kcalPerDay < 500 || kcalPerDay > 10000) return null;

  const protein = parseAmount(searchParams.get(PARAM.protein));
  const carbs = parseAmount(searchParams.get(PARAM.carbs));
  const fat = parseAmount(searchParams.get(PARAM.fat));
  if (!protein || !carbs || !fat) return null;

  return { kcalPerDay, macros: { protein, carbs, fat } };
}
