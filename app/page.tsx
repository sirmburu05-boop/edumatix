import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-2 text-xs uppercase tracking-widest text-ink-soft font-mono">
        Edumatix · Phase 0
      </div>
      <h1 className="font-serif text-4xl font-semibold mb-4">
        Edu<span className="text-amber">matix</span>
      </h1>
      <p className="text-ink-soft font-serif text-lg leading-relaxed mb-8 max-w-xl">
        Cluster points, career guidance, and university data for Kenyan
        high school students — built to be accurate first, everything else second.
      </p>
<div className="flex gap-3 flex-wrap">
  <Link
    href="/calculator"
    className="inline-block bg-seal text-white font-mono text-sm uppercase tracking-wide px-6 py-3 rounded-sm hover:bg-[#734a22] transition"
  >
    Open Cluster Calculator →
  </Link>
  <Link
    href="/institutions"
    className="inline-block bg-white border border-paper-line text-ink font-mono text-sm uppercase tracking-wide px-6 py-3 rounded-sm hover:border-seal transition"
  >
    Browse Institutions →
  </Link>
</div>
    </main>
  );
}
