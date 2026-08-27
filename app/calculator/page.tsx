"use client";

import { useMemo, useState } from "react";
import {
  ALL_SUBJECTS,
  GRADES,
  GROUPS,
  SUBJECT_CODES,
  calculateAllClusters,
  type ClusterResult,
} from "@/lib/clusterEngine";

const SUBJECT_LIST = [...ALL_SUBJECTS].sort(
  (a, b) => (SUBJECT_CODES[a] ?? 999) - (SUBJECT_CODES[b] ?? 999)
);

function subjectGroupOf(name: string): string | undefined {
  return (Object.keys(GROUPS) as (keyof typeof GROUPS)[]).find((g) =>
    (GROUPS[g] as readonly string[]).includes(name)
  );
}

export default function CalculatorPage() {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [results, setResults] = useState<ClusterResult[] | null>(null);
  const [m, setM] = useState(0);
  const [best7, setBest7] = useState<[string, number][]>([]);

  const count = Object.keys(selected).length;
  const hasCore = ["English", "Kiswahili", "Mathematics"].every((s) => selected[s]);
  const canCalculate = hasCore && count >= 7;

  function setGrade(subject: string, grade: string | null) {
    setSelected((prev) => {
      const next = { ...prev };
      if (grade === null) {
        delete next[subject];
      } else {
        if (!(subject in next) && Object.keys(next).length >= 8) return prev;
        next[subject] = grade;
      }
      return next;
    });
    setOpenPicker(null);
  }

  function calculate() {
    const { results, m, best7 } = calculateAllClusters(selected);
    setResults(results);
    setM(m);
    setBest7(best7);
  }

  const groupStrength = useMemo(() => {
    const totals: Record<string, number[]> = { I: [], II: [], III: [], IV: [], V: [] };
    Object.entries(selected).forEach(([name, grade]) => {
      const g = subjectGroupOf(name);
      if (g) {
        const points = GRADES.find(([l]) => l === grade)?.[1] ?? 0;
        totals[g].push(points);
      }
    });
    return totals;
  }, [selected]);

  const topPicks = results?.filter((c) => c.points > 0).slice(0, 5) ?? [];

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 pb-20">
      <div className="text-xs uppercase tracking-widest text-ink-soft font-mono mb-1">
        Edu<span className="text-amber">matix</span> · Cluster Points Calculator
      </div>
      <p className="font-serif text-ink-soft text-[15px] leading-relaxed max-w-xl mb-8">
        Select every subject you sat (up to 8), tap to set your grade, then
        calculate. Rules verified directly against official KUCCPS programme
        pages, cluster by cluster.
      </p>

      {/* Subject list */}
      <section className="bg-card border border-paper-line rounded-sm mb-6">
        <div className="flex items-center justify-between px-5 py-3 border-b border-paper-line">
          <h2 className="font-serif font-semibold text-[17px]">Your subjects</h2>
          <span className="font-mono text-xs text-ink-soft">{count}/8 selected</span>
        </div>
        <div className="divide-y divide-paper-line">
          {SUBJECT_LIST.map((subj) => {
            const grade = selected[subj];
            const isOpen = openPicker === subj;
            return (
              <div key={subj}>
                <div
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#faf8f0] ${
                    grade ? "bg-[#fff8ea]" : ""
                  }`}
                  onClick={() => setOpenPicker(isOpen ? null : subj)}
                >
                  <span className="font-mono text-[11px] text-ink-soft w-9">
                    {SUBJECT_CODES[subj] ?? ""}
                  </span>
                  <span className="flex-1 text-[13.5px]">{subj}</span>
                  <span
                    className={`font-mono text-[11.5px] font-bold px-2.5 py-1 rounded-full border min-w-[78px] text-center ${
                      grade
                        ? "bg-seal text-white border-seal"
                        : "bg-paper text-ink-soft border-paper-line"
                    }`}
                  >
                    {grade ?? "Not taken"}
                  </span>
                </div>
                {isOpen && (
                  <div className="grid grid-cols-6 gap-1.5 px-4 pb-3 bg-[#fff8ea]">
                    {GRADES.map(([label]) => (
                      <button
                        key={label}
                        onClick={(e) => {
                          e.stopPropagation();
                          setGrade(subj, label);
                        }}
                        className={`font-mono font-bold text-[13px] py-2 rounded-sm border ${
                          grade === label
                            ? "bg-seal text-white border-seal"
                            : "bg-white border-paper-line hover:border-seal"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setGrade(subj, null);
                      }}
                      className="col-span-6 text-[11px] uppercase tracking-wide text-fail bg-white border border-dashed border-fail rounded-sm py-1.5"
                    >
                      Mark as not taken
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3 text-xs text-ink-soft">
          {!hasCore
            ? "Compulsory: English, Kiswahili, Mathematics — select these first."
            : count < 7
            ? `Select at least 7 subjects (you have ${count}) — m needs your best 7.`
            : `${count} subjects selected. Ready to calculate.`}
        </div>
      </section>

      <button
        onClick={calculate}
        disabled={!canCalculate}
        className="font-mono text-xs uppercase font-bold tracking-wide bg-seal text-white px-6 py-3 rounded-sm mb-6 disabled:bg-[#b9b09a] disabled:cursor-not-allowed hover:enabled:bg-[#734a22]"
      >
        Calculate cluster points
      </button>

      {results && (
        <>
          <section className="bg-card border border-paper-line rounded-sm mb-6">
            <div className="flex items-center justify-between px-5 py-3 border-b border-paper-line">
              <h2 className="font-serif font-semibold text-[17px]">Your 20 clusters</h2>
              <span className="text-xs text-ink-soft">ranked by points</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 px-5 py-3 border-b border-paper-line bg-[#f7f5ec] font-mono text-xs text-ink-soft">
              <div>
                Best 7 subjects (m): <b className="text-ink text-[15px]">{m.toFixed(0)}</b> / 84
              </div>
              <div>{best7.map(([n, p]) => `${n} (${p})`).join(" · ")}</div>
            </div>
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b-2 border-ink text-left text-[11px] uppercase tracking-wide text-ink-soft">
                  <th className="py-2 px-3"></th>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Cluster</th>
                  <th className="py-2 px-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {results.map((c, i) => (
                  <tr key={c.n} className="border-b border-paper-line hover:bg-[#fbf6e8]">
                    <td className="py-2 px-3 font-mono text-ink-soft">{i + 1}</td>
                    <td className="py-2 px-3 font-mono text-seal font-semibold">C{c.n}</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold">{c.name}</div>
                      {c.missing && (
                        <div className="text-[11.5px] text-fail mt-0.5">Missing: {c.missing}</div>
                      )}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-mono font-bold text-[14.5px] ${
                        c.points === 0 ? "text-fail" : i < 3 ? "text-pass" : ""
                      }`}
                    >
                      {c.points.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="bg-card border border-paper-line rounded-sm grid md:grid-cols-2">
            <div className="p-5 border-b md:border-b-0 md:border-r border-paper-line">
              <h3 className="font-serif font-semibold text-[15px] mb-2">Best clusters to pursue</h3>
              {topPicks.length === 0 && (
                <p className="text-sm text-ink-soft">No clusters qualify yet.</p>
              )}
              {topPicks.map((c) => (
                <div key={c.n} className="flex justify-between py-2 border-b border-dashed border-paper-line last:border-none">
                  <div>
                    <div className="font-semibold text-[13.5px]">C{c.n} · {c.name}</div>
                  </div>
                  <div className="font-mono font-bold text-pass">{c.points.toFixed(3)}</div>
                </div>
              ))}
            </div>
            <div className="p-5">
              <h3 className="font-serif font-semibold text-[15px] mb-2">Subject-group strength</h3>
              {(["I", "II", "III", "IV", "V"] as const).map((g) => {
                const arr = groupStrength[g];
                const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
                const pct = Math.round((avg / 12) * 100);
                return (
                  <div key={g} className="flex items-center gap-2 mb-2 text-xs">
                    <div className="w-32 text-ink-soft">Group {g}</div>
                    <div className="flex-1 h-2 bg-[#eee9d8] rounded-sm overflow-hidden">
                      <div className="h-full bg-amber" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="w-8 text-right font-mono">{arr.length ? avg.toFixed(1) : "—"}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
