export const LIBRARY_CATEGORIES = [
  "PROGRAMS",
  "ENGLISH",
  "GERMAN",
  "RELIGION",
  "ENTERTAINMENT",
] as const;

export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<LibraryCategory, string> = {
  PROGRAMS: "Programs",
  ENGLISH: "English",
  GERMAN: "German",
  RELIGION: "Religion",
  ENTERTAINMENT: "Entertainment",
};

/** Default mix for Momen (sums to 100). */
export const DEFAULT_CONTENT_MIX: Record<LibraryCategory, number> = {
  PROGRAMS: 40,
  ENGLISH: 30,
  GERMAN: 20,
  RELIGION: 5,
  ENTERTAINMENT: 5,
};

export function isLibraryCategory(value: string): value is LibraryCategory {
  return (LIBRARY_CATEGORIES as readonly string[]).includes(value);
}

export function mixSum(rows: { category: string; percent: number }[]): number {
  return rows.reduce((sum, row) => sum + row.percent, 0);
}
