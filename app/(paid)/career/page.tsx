import Link from "next/link";

export default function CareerPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-serif text-2xl font-semibold mb-2">Career Guidance</h1>
      <p className="text-sm text-ink-soft mb-6">Coming soon. Your account is activated, so you will get this the moment it launches.</p>
      <Link href="/dashboard" className="text-sm underline">Back to dashboard</Link>
    </main>
  );
}
