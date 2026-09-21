import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, curriculum, activated")
    .eq("id", user.id)
    .single();

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-soft font-mono mb-1">
            Edu<span className="text-amber">matix</span> · Dashboard
          </div>
          <h1 className="font-serif text-2xl font-semibold">
            Welcome, {profile?.full_name ?? user.email}
          </h1>
        </div>
        <SignOutButton />
      </div>

      {!profile?.activated && (
        <div className="bg-[#fff8ea] border border-amber rounded-sm p-5 mb-6">
          <h2 className="font-serif font-semibold text-lg mb-1">Activate your account</h2>
          <p className="text-sm text-ink-soft mb-3">
            A one-time activation of <b>KSh 299</b> unlocks the Cluster Calculator results,
            Career Guidance, and Institution Explorer eligibility checks.
          </p>
          <Link
            href="/activate"
            className="inline-block bg-seal text-white font-mono text-xs uppercase tracking-wide px-5 py-2.5 rounded-sm hover:bg-[#734a22]"
          >
            Activate now — KSh 299
          </Link>
        </div>
      )}

      {profile?.activated && (
        <div className="bg-pass-bg border border-pass rounded-sm p-4 mb-6 text-sm text-pass font-semibold">
          ✓ Your account is activated.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <Link href="/calculator" className={cardCls}>Cluster Calculator</Link>
        <Link href="/institutions" className={cardCls}>Institution Explorer</Link>
      </div>
    </main>
  );
}

const cardCls =
  "block bg-card border border-paper-line rounded-sm p-4 font-serif font-semibold hover:border-seal transition";
