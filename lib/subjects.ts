/**
 * Client-safe subject data (no cluster rules, no calculation).
 * The calculator page imports ONLY from this file, so the cluster engine
 * stays on the server and unactivated students never receive real results.
 */

export const GRADES: [string, number][] = [
  ["A", 12], ["A-", 11], ["B+", 10], ["B", 9], ["B-", 8], ["C+", 7],
  ["C", 6], ["C-", 5], ["D+", 4], ["D", 3], ["D-", 2], ["E", 1],
];
export const GRADE_POINTS: Record<string, number> = Object.fromEntries(GRADES);

export const GROUPS = {
  I: ["English", "Kiswahili", "Mathematics"],
  II: ["Biology", "Physics", "Chemistry", "Physical Sciences", "Biological Sciences", "General Science"],
  III: ["History and Government", "Geography", "CRE", "IRE", "HRE"],
  IV: [
    "Home Science", "Art and Design", "Agriculture", "Woodwork", "Metalwork",
    "Building Construction", "Power Mechanics", "Electricity", "Drawing and Design",
    "Aviation Technology", "Computer Studies",
  ],
  V: ["French", "German", "Arabic", "Kenyan Sign Language", "Music", "Business Studies", "Commerce"],
} as const;

export type GroupKey = keyof typeof GROUPS;
export const ALL_SUBJECTS: string[] = ([] as string[]).concat(
  GROUPS.I, GROUPS.II, GROUPS.III, GROUPS.IV, GROUPS.V
);

// Best-known KNEC subject codes — used only to fix a stable display order.
// Not independently verified against the current official KNEC code list;
// cross-check before treating as authoritative anywhere else.
export const SUBJECT_CODES: Record<string, number> = {
  English: 101, Kiswahili: 102, "Kenyan Sign Language": 103, Mathematics: 121,
  Biology: 231, Physics: 232, Chemistry: 233, "Physical Sciences": 234,
  "Biological Sciences": 235, "General Science": 236,
  "History and Government": 311, Geography: 312, CRE: 313, IRE: 314, HRE: 315,
  "Home Science": 441, "Art and Design": 442, Agriculture: 443, Woodwork: 444,
  Metalwork: 445, "Building Construction": 446, "Power Mechanics": 447,
  Electricity: 448, "Drawing and Design": 449, "Aviation Technology": 450,
  "Computer Studies": 451, French: 501, German: 502, Arabic: 503, Music: 511,
  "Business Studies": 565,
};
