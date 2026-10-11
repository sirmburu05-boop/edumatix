/**
 * Edumatix cluster points engine.
 *
 * This is the single source of truth for cluster-points logic. Every page
 * (calculator, career guidance, etc.) must import from here rather than
 * re-implementing the formula or the 18-cluster rule table.
 *
 * Cluster rules were transcribed directly from official KUCCPS programme
 * detail pages (students.kuccps.net/programmes/detail/<id>/), one screenshot
 * per cluster, verified August 2026. This supersedes any earlier hand-typed
 * table. KUCCPS publishes only 18 degree clusters — there is no Cluster 19
 * or 20 for degree programmes.
 */

import { GRADES, GRADE_POINTS, GROUPS, ALL_SUBJECTS, SUBJECT_CODES } from "./subjects";
export { GRADES, GRADE_POINTS, GROUPS, ALL_SUBJECTS, SUBJECT_CODES };
import type { GroupKey } from "./subjects";
export type { GroupKey };

export interface Slot {
  label: string;
  match: (subject: string) => boolean;
}
export interface Cluster {
  n: number;
  name: string;
  slots: Slot[];
}

const only = (...names: string[]): Slot["match"] => (s) => names.includes(s);
const anyOf = (...groups: GroupKey[]): Slot["match"] => (s) =>
  groups.some((g) => (GROUPS[g] as readonly string[]).includes(s));
const unionMatch = (...matchers: Slot["match"][]): Slot["match"] => (s) =>
  matchers.some((m) => m(s));
const slot = (label: string, match: Slot["match"]): Slot => ({ label, match });
const LANG3 = only("English", "Kiswahili", "Kenyan Sign Language");

export const CLUSTERS: Cluster[] = [
  { n: 1, name: "Law", slots: [
    slot("English or Kiswahili (best of the two)", only("English", "Kiswahili")),
    slot("Mathematics or any Group II science", unionMatch(only("Mathematics"), anyOf("II"))),
    slot("Group III (History/Government, Geography, CRE, IRE, HRE)", anyOf("III")),
    slot("Any remaining Group II / III / IV / V subject", anyOf("II", "III", "IV", "V")),
  ]},
  { n: 2, name: "Business, Hospitality, Tourism and Related", slots: [
    slot("Mathematics or Business Studies", unionMatch(only("Mathematics"), only("Business Studies"))),
    slot("English, Kiswahili or Kenyan Sign Language", LANG3),
    slot("Any Group II or Group III subject", anyOf("II", "III")),
    slot("Any remaining Group II / III / IV / V subject", anyOf("II", "III", "IV", "V")),
  ]},
  { n: 3, name: "Communication, Media, Languages, Public Relations, International Relations, Film, Graphics and Related", slots: [
    slot("English, Kiswahili or Kenyan Sign Language", LANG3),
    slot("Mathematics or any Group II science", unionMatch(only("Mathematics"), anyOf("II"))),
    slot("Group III (History/Government, Geography, CRE, IRE, HRE)", anyOf("III")),
    slot("Any remaining Group II / III / IV / V subject", anyOf("II", "III", "IV", "V")),
  ]},
  { n: 4, name: "Geosciences and Related", slots: [
    slot("Mathematics", only("Mathematics")),
    slot("Physics", only("Physics")),
    slot("Biology, Chemistry or Geography", only("Biology", "Chemistry", "Geography")),
    slot("Any remaining Group II / III / IV / V subject", anyOf("II", "III", "IV", "V")),
  ]},
  { n: 5, name: "Engineering, Engineering Technology, Energy and Related", slots: [
    slot("Mathematics", only("Mathematics")),
    slot("Physics", only("Physics")),
    slot("Chemistry", only("Chemistry")),
    slot("Any remaining Group II / III / IV / V subject", anyOf("II", "III", "IV", "V")),
  ]},
  { n: 6, name: "Architecture, Quantity Survey, Building Construction, Urban Planning and Related", slots: [
    slot("Mathematics", only("Mathematics")),
    slot("Physics", only("Physics")),
    slot("Group III (History/Government, Geography, CRE, IRE, HRE)", anyOf("III")),
    slot("Any remaining Group II / III / IV / V subject", anyOf("II", "III", "IV", "V")),
  ]},
  { n: 7, name: "Computer Science, Cyber Security, Information Technology and Related", slots: [
    slot("Mathematics", only("Mathematics")),
    slot("Physics", only("Physics")),
    slot("Any Group II or Group III subject", anyOf("II", "III")),
    slot("Any remaining Group II / III / IV / V subject", anyOf("II", "III", "IV", "V")),
  ]},
  { n: 8, name: "Agricultural Economics, Agribusiness and Related", slots: [
    slot("Mathematics", only("Mathematics")),
    slot("Biology", only("Biology")),
    slot("Physics or Chemistry", only("Physics", "Chemistry")),
    slot("Any remaining Group II / III / IV / V subject", anyOf("II", "III", "IV", "V")),
  ]},
  { n: 9, name: "General Sciences, Biological Sciences, Physics, Chemistry and Related", slots: [
    slot("Mathematics", only("Mathematics")),
    slot("Any Group II science", anyOf("II")),
    slot("Any other Group II science", anyOf("II")),
    slot("Any remaining Group II / III / IV / V subject", anyOf("II", "III", "IV", "V")),
  ]},
  { n: 10, name: "Actuarial Science, Mathematics, Statistics and Related", slots: [
    slot("Mathematics", only("Mathematics")),
    slot("Any Group II science", anyOf("II")),
    slot("Group III (History/Government, Geography, CRE, IRE, HRE)", anyOf("III")),
    slot("Any remaining Group II / III / IV / V subject", anyOf("II", "III", "IV", "V")),
  ]},
  { n: 11, name: "Interior Design, Fashion Design, Textile and Related", slots: [
    slot("Chemistry", only("Chemistry")),
    slot("Mathematics or Physics", only("Mathematics", "Physics")),
    slot("Home Science, Art and Design, Drawing and Design, or Biology", only("Home Science", "Art and Design", "Drawing and Design", "Biology")),
    slot("Any remaining subject (incl. English/Kiswahili) / Group II / III / IV / V", unionMatch(only("English", "Kiswahili"), anyOf("II", "III", "IV", "V"))),
  ]},
  { n: 12, name: "Sports Science and Related", slots: [
    slot("Biology or General Science", only("Biology", "General Science")),
    slot("Mathematics", only("Mathematics")),
    slot("Any Group II or Group III subject", anyOf("II", "III")),
    slot("Any remaining subject (incl. English/Kiswahili) / Group II / III / IV / V", unionMatch(only("English", "Kiswahili"), anyOf("II", "III", "IV", "V"))),
  ]},
  { n: 13, name: "Medicine, Nursing, Dentistry, Pharmacy, Health Sciences and Related", slots: [
    slot("Biology", only("Biology")),
    slot("Chemistry", only("Chemistry")),
    slot("Mathematics or Physics", only("Mathematics", "Physics")),
    slot("Any remaining subject (incl. English/Kiswahili) / Group II / III / IV / V", unionMatch(only("English", "Kiswahili"), anyOf("II", "III", "IV", "V"))),
  ]},
  { n: 14, name: "History, Archeology, Geography and Related", slots: [
    slot("History/Government or Geography", only("History and Government", "Geography")),
    slot("English, Kiswahili or Kenyan Sign Language", LANG3),
    slot("Mathematics or any Group II science", unionMatch(only("Mathematics"), anyOf("II"))),
    slot("Any remaining Group II / III / IV / V subject", anyOf("II", "III", "IV", "V")),
  ]},
  { n: 15, name: "Agriculture, Animal Health, Food Science and Nutrition, Environmental Sciences, Natural Resources and Related", slots: [
    slot("Biology", only("Biology")),
    slot("Chemistry", only("Chemistry")),
    slot("Mathematics, Physics or Geography", only("Mathematics", "Physics", "Geography")),
    slot("Any remaining subject (incl. English/Kiswahili) / Group II / III / IV / V", unionMatch(only("English", "Kiswahili"), anyOf("II", "III", "IV", "V"))),
  ]},
  { n: 16, name: "Music and Related", slots: [
    slot("Music", only("Music")),
    slot("English, Kiswahili or Kenyan Sign Language", LANG3),
    slot("Mathematics, or any Group II or Group III subject", unionMatch(only("Mathematics"), anyOf("II", "III"))),
    slot("Any remaining Group II / III / IV / V subject", anyOf("II", "III", "IV", "V")),
  ]},
  { n: 17, name: "Education and Related", slots: [
    slot("English", only("English")),
    slot("Mathematics or any Group II science", unionMatch(only("Mathematics"), anyOf("II"))),
    slot("Any Group II science", anyOf("II")),
    slot("Any remaining subject (incl. Kiswahili) / Group II / III / IV / V", unionMatch(only("Kiswahili"), anyOf("II", "III", "IV", "V"))),
  ]},
  { n: 18, name: "Religious Studies, Theology, Islamic Studies and Related", slots: [
    slot("CRE, IRE or HRE", only("CRE", "IRE", "HRE")),
    slot("English, Kiswahili or Kenyan Sign Language", LANG3),
    slot("Any Group II, IV or V subject", anyOf("II", "IV", "V")),
    slot("Any remaining Group II / IV / V subject", anyOf("II", "IV", "V")),
  ]},
];

export function computeM(subjectPoints: Record<string, number>) {
  const sorted = Object.entries(subjectPoints).sort((a, b) => b[1] - a[1]);
  const best7 = sorted.slice(0, 7);
  const m = best7.reduce((s, [, p]) => s + p, 0);
  return { m, best7 };
}

export interface AssignmentResult {
  r: number;
  missing?: string;
  subjects?: string[];
}

export function bestSlotAssignment(
  slots: Slot[],
  subjectPoints: Record<string, number>
): AssignmentResult {
  const names = Object.keys(subjectPoints);
  const cands = slots.map((sl) => names.filter((n) => sl.match(n)));
  const missingIdx = cands.findIndex((c) => c.length === 0);
  if (missingIdx !== -1) return { r: 0, missing: slots[missingIdx].label };

  const order = cands.map((_, i) => i).sort((a, b) => cands[a].length - cands[b].length);
  let best: { sum: number; chosen: [number, string][] } | null = null;

  function search(idx: number, used: Set<string>, sum: number, chosen: [number, string][]) {
    if (idx === order.length) {
      if (best === null || sum > best.sum) best = { sum, chosen: chosen.slice() };
      return;
    }
    const slotIdx = order[idx];
    for (const cand of cands[slotIdx]) {
      if (used.has(cand)) continue;
      used.add(cand);
      chosen.push([slotIdx, cand]);
      search(idx + 1, used, sum + subjectPoints[cand], chosen);
      chosen.pop();
      used.delete(cand);
    }
  }
  search(0, new Set(), 0, []);
  if (!best) return { r: 0, missing: "not enough distinct subjects to fill this cluster's four slots" };
  const b = best as { sum: number; chosen: [number, string][] };
  return { r: b.sum, subjects: b.chosen.map(([, name]) => name) };
}

export function clusterPointsFormula(r: number, m: number): number {
  const val = Math.sqrt((r / 48) * (m / 84)) * 48;
  return Math.min(val, 48);
}

export interface ClusterResult extends Cluster {
  r: number;
  points: number;
  missing?: string;
}

/** Full pipeline: student subject grades -> ranked cluster results. */
export function calculateAllClusters(
  subjectGrades: Record<string, string>
): { results: ClusterResult[]; m: number; best7: [string, number][] } {
  const subjectPoints: Record<string, number> = {};
  Object.entries(subjectGrades).forEach(([subj, grade]) => {
    subjectPoints[subj] = GRADE_POINTS[grade];
  });

  const { m, best7 } = computeM(subjectPoints);

  const results: ClusterResult[] = CLUSTERS.map((c) => {
    const { r, missing } = bestSlotAssignment(c.slots, subjectPoints);
    const points = missing ? 0 : clusterPointsFormula(r, m);
    return { ...c, r: missing ? 0 : r, points, missing };
  }).sort((a, b) => b.points - a.points);

  return { results, m, best7 };
}
