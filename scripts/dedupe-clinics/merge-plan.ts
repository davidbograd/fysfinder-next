// Builds the final keep/drop job list from high-confidence groups plus approved extras.
// Updated: forces Hovedstadens Sportsklinik as keeper when that extra pair is included.

import type { ApprovedExtraMerge } from "./approved-extra-merges";
import type { ClinicCandidate, DuplicateGroup } from "./logic";

export interface MergeJob {
  keeper: ClinicCandidate;
  dropped: ClinicCandidate;
  source: string;
}

export function collectMergeJobs(
  groups: DuplicateGroup[],
  extras: ApprovedExtraMerge[],
  candidates: ClinicCandidate[]
): MergeJob[] {
  const byId = new Map(candidates.map((clinic) => [clinic.clinics_id, clinic]));
  const jobs: MergeJob[] = [];
  const droppedIds = new Set<string>();

  for (const group of groups) {
    if (group.decision !== "high_confidence" || !group.keeper) continue;
    for (const dropped of group.drops) {
      jobs.push({
        keeper: group.keeper,
        dropped,
        source: group.reason,
      });
      droppedIds.add(dropped.clinics_id);
    }
  }

  for (const extra of extras) {
    if (droppedIds.has(extra.droppedId)) continue;
    const keeper = byId.get(extra.keeperId);
    const dropped = byId.get(extra.droppedId);
    if (!dropped) continue;
    if (!keeper) {
      throw new Error(
        `Approved extra merge keeper is missing: ${extra.note} (${extra.keeperId})`
      );
    }
    jobs.push({ keeper, dropped, source: extra.note });
    droppedIds.add(extra.droppedId);
  }

  return jobs;
}
