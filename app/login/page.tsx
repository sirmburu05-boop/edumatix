"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-widest text-ink-soft font-mono mb-1">
        Edu<span className="text-amber">matix</span>
      </div>
      <h1 className="font-serif text-2xl font-semibold mb-6">Log in</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </Field>

        {error && <p className="text-fail text-sm bg-fail-bg p-2.5 rounded-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-seal text-white font-mono text-xs uppercase tracking-wide py-3 rounded-sm hover:bg-[#734a22] disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-sm text-ink-soft mt-5 text-center">
        No account yet?{" "}
        <Link href="/signup" className="text-seal underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}

const inputCls = "w-full text-[13px] px-3 py-2.5 border border-paper-line rounded-sm bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10.5px] uppercase tracking-wide text-ink-soft font-bold mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
