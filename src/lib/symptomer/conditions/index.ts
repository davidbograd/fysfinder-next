// Added: 2026-09-07 - Registry of all conditions in the symptom universe. Adding a condition means adding a data file here, not a new page layout.

import { artrose } from "./artrose";
import { loeberknae } from "./loeberknae";
import { meniskskade } from "./meniskskade";
import { patellofemoraleSmerter } from "./patellofemorale-smerter";
import { springerknae } from "./springerknae";
import type { Condition } from "../types";

/** Display order used by condition grids when no explicit order is given. */
export const conditions: Condition[] = [
  loeberknae,
  springerknae,
  patellofemoraleSmerter,
  meniskskade,
  artrose,
];
