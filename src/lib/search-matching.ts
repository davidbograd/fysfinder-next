// Conservative typeahead matching for city and specialty search.
// Updated: 2026-09-06 - Fold Danish letters and allow prefix, contains, and 1-edit typos.

import { slugify } from "@/app/utils/slugify";

export function foldSearchText(value: string): string {
  return slugify(value).replace(/-/g, "");
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const rows = a.length + 1;
  const cols = b.length + 1;
  const previous = new Array<number>(cols);
  const current = new Array<number>(cols);

  for (let col = 0; col < cols; col += 1) previous[col] = col;

  for (let row = 1; row < rows; row += 1) {
    current[0] = row;
    for (let col = 1; col < cols; col += 1) {
      const substitutionCost = a[row - 1] === b[col - 1] ? 0 : 1;
      current[col] = Math.min(
        previous[col] + 1,
        current[col - 1] + 1,
        previous[col - 1] + substitutionCost
      );
    }
    for (let col = 0; col < cols; col += 1) previous[col] = current[col];
  }

  return previous[b.length];
}

export function isTypoMatch(query: string, candidate: string): boolean {
  if (query.length < 4) return false;

  if (
    Math.abs(query.length - candidate.length) <= 1 &&
    levenshtein(query, candidate) <= 1
  ) {
    return true;
  }

  if (candidate.length >= query.length) {
    return levenshtein(query, candidate.slice(0, query.length)) <= 1;
  }

  return levenshtein(candidate, query.slice(0, candidate.length)) <= 1;
}

/** Lower scores rank first. `null` means no match. */
export function rankFoldedMatch(query: string, candidate: string): number | null {
  const foldedQuery = foldSearchText(query);
  const foldedCandidate = foldSearchText(candidate);
  if (!foldedQuery || !foldedCandidate) return null;
  if (foldedCandidate === foldedQuery) return 0;
  if (foldedCandidate.startsWith(foldedQuery)) return 1;
  if (foldedCandidate.includes(foldedQuery)) return 2;
  if (isTypoMatch(foldedQuery, foldedCandidate)) return 3;
  return null;
}

export function rankSearchItems<T>(
  items: T[],
  query: string,
  getCandidateText: (item: T) => string
): T[] {
  return items
    .map((item) => ({
      item,
      rank: rankFoldedMatch(query, getCandidateText(item)),
    }))
    .filter(
      (entry): entry is { item: T; rank: number } => entry.rank !== null
    )
    .sort((left, right) => {
      if (left.rank !== right.rank) return left.rank - right.rank;
      return getCandidateText(left.item).localeCompare(
        getCandidateText(right.item),
        "da"
      );
    })
    .map((entry) => entry.item);
}

export function pickBestSearchItem<T>(
  items: T[],
  query: string,
  getCandidateText: (item: T) => string
): T | null {
  return rankSearchItems(items, query, getCandidateText)[0] ?? null;
}
