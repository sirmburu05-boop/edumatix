import { redirect } from "next/navigation";
import Link from "next/link";
import { getAccess } from "@/lib/access";

// Every page inside the (paid) folder is protected by this check, on the server.
// To protect a new page, just put it inside app/(paid)/.
export default async function PaidLayout({ children }: { children: React.ReactNode }) {
  const { user, activated } = await getAccess();

  if (!user) redirect("/login");

  if (!activated) {
    return (
      <main className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="text-3xl mb-3">🔒</div>
        <h1 className="font-serif text-2xl font-semibold mb-2">This feature needs activation</h1>
        <p className="text-sm text-ink-soft mb-6">
          A one-time payment of <b>KSh 299</b> unlocks Career Guidance, the AI Tutor and more.
        </p>
        <Link
          href="/activate"
          className="inline-block bg-seal text-white font-mono text-sm uppercase tracking-wide px-6 py-3 rounded-sm hover:bg-[#734a22]"
        >
          Activate now - KSh 299
        </Link>
        <div className="mt-4">
          <Link href="/dashboard" className="text-sm text-ink-soft underline">Back to dashboard</Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
