"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Institution {
  id: number;
  name: string;
  category: string;
  type: string;
  county: string;
  parent_ministry: string | null;
  website: string | null;
}

interface ProgrammeRow {
  cutoff_2024: number | null;
  programmes: {
    name: string;
    cluster_number: number;
    minimum_mean_grade: string | null;
    minimum_verified: boolean;
  } | null;
}

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [county, setCounty] = useState("");
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<Institution | null>(null);
  const [programmes, setProgrammes] = useState<ProgrammeRow[] | null>(null);
  const [programmesLoading, setProgrammesLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("institutions")
        .select("id, name, category, type, county, parent_ministry, website")
        .order("name");
      if (error) {
        setError(error.message);
      } else {
        setInstitutions(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const counties = useMemo(
    () => [...new Set(institutions.map((i) => i.county))].sort(),
    [institutions]
  );

  const filtered = useMemo(() => {
    return institutions.filter(
      (i) =>
        (!category || i.category === category) &&
        (!type || i.type === type) &&
        (!county || i.county === county) &&
        (!search || i.name.toUpperCase().includes(search.toUpperCase()))
    );
  }, [institutions, category, type, county, search]);

  async function openInstitution(inst: Institution) {
    setSelected(inst);
    setProgrammesLoading(true);
    const { data, error } = await supabase
      .from("institution_programmes")
      .select("cutoff_2024, programmes(name, cluster_number, minimum_mean_grade, minimum_verified)")
      .eq("institution_id", inst.id);
    if (!error) setProgrammes(data as unknown as ProgrammeRow[]);
    setProgrammesLoading(false);
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 pb-20">
      <div className="text-xs uppercase tracking-widest text-ink-soft font-mono mb-1">
        Edu<span className="text-amber">matix</span> · Institution Explorer
      </div>
      <p className="font-serif text-ink-soft text-[15px] leading-relaxed max-w-2xl mb-6">
        Every university and public college registered with KUCCPS —{" "}
        <b className="text-ink">{institutions.length || 512} institutions</b>, queried live from
        the database. Programme data is loaded for a working sample so far (Law, Medicine, Nursing).
      </p>

      <div className="flex flex-wrap gap-3 items-end bg-card border border-paper-line rounded-sm p-4 mb-4">
        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
            <option value="">All</option>
            <option>University</option>
            <option>College</option>
          </select>
        </Field>
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
            <option value="">All</option>
            <option>Public</option>
            <option>Private</option>
          </select>
        </Field>
        <Field label="County">
          <select value={county} onChange={(e) => setCounty(e.target.value)} className={selectCls}>
            <option value="">All counties</option>
            {counties.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Search by name">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. Kenyatta"
            className={selectCls}
          />
        </Field>
      </div>

      {loading && <p className="text-ink-soft text-sm">Loading institutions from the database…</p>}
      {error && (
        <p className="text-fail text-sm bg-fail-bg border border-fail rounded-sm p-3">
          Couldn&apos;t load institutions: {error}. Check your Supabase env vars and that the seed
          data has been run.
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="text-xs text-ink-soft mb-3 font-mono">
            {filtered.length} institution{filtered.length !== 1 ? "s" : ""} shown
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {filtered.slice(0, 400).map((inst) => (
              <div
                key={inst.id}
                onClick={() => openInstitution(inst)}
                className="bg-card border border-paper-line rounded-sm p-4 cursor-pointer hover:border-seal"
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <div className="font-serif font-semibold text-[15px] leading-tight">{inst.name}</div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Badge tone={inst.type === "Public" ? "pass" : "priv"}>{inst.type}</Badge>
                    <Badge tone="neutral">{inst.category}</Badge>
                  </div>
                </div>
                <div className="text-xs text-ink-soft">📍 {inst.county} County</div>
              </div>
            ))}
          </div>
          {filtered.length > 400 && (
            <p className="text-center text-ink-soft text-sm mt-4">
              Showing first 400 of {filtered.length} — narrow your filters to see more precisely.
            </p>
          )}
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-md bg-paper shadow-xl overflow-y-auto">
            <div className="bg-ink text-paper p-5 relative">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-5 text-paper text-xl"
              >
                ✕
              </button>
              <h2 className="font-serif text-xl pr-8">{selected.name}</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                <InfoItem label="Category" value={selected.category} />
                <InfoItem label="Type" value={selected.type} />
                <InfoItem label="County" value={`${selected.county} County`} />
                <InfoItem label="Parent Ministry" value={selected.parent_ministry ?? "—"} />
              </div>
              <div className="border border-dashed border-paper-line text-xs text-ink-soft p-3 rounded-sm mb-5">
                🔗 Official website —{" "}
                {selected.website ? (
                  <a href={selected.website} target="_blank" className="text-seal underline">
                    {selected.website}
                  </a>
                ) : (
                  "not yet loaded"
                )}
              </div>
              <h3 className="font-serif font-semibold text-[15px] border-t border-paper-line pt-4 mb-3">
                Programmes offered
              </h3>
              {programmesLoading && <p className="text-sm text-ink-soft">Loading…</p>}
              {!programmesLoading && (!programmes || programmes.length === 0) && (
                <p className="text-sm text-ink-soft italic">
                  No programme data loaded yet for this institution.
                </p>
              )}
              {programmes?.map((row, i) => (
                <div key={i} className="text-sm py-2 border-b border-dashed border-paper-line last:border-none">
                  <div className="font-semibold">{row.programmes?.name}</div>
                  <div className="text-xs text-ink-soft">
                    Cluster {row.programmes?.cluster_number}
                    {row.cutoff_2024 ? ` · 2024 cutoff: ${row.cutoff_2024}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const selectCls =
  "text-[13px] px-2.5 py-1.5 border border-paper-line rounded-sm bg-white text-ink min-w-[150px]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10.5px] uppercase tracking-wide text-ink-soft font-bold">{label}</label>
      {children}
    </div>
  );
}

function Badge({ tone, children }: { tone: "pass" | "priv" | "neutral"; children: React.ReactNode }) {
  const cls =
    tone === "pass"
      ? "bg-pass-bg text-pass"
      : tone === "priv"
      ? "bg-[#e6e4f5] text-[#4b3f8a]"
      : "bg-[#eee9d8] text-ink-soft";
  return (
    <span className={`font-mono text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${cls}`}>
      {children}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-ink-soft font-bold mb-0.5">{label}</div>
      <div className="text-[13px]">{value}</div>
    </div>
  );
}