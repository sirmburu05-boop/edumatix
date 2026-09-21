"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // If email confirmation is OFF in Supabase, signUp() returns a live
    // session immediately -- no email click needed, go straight to the
    // dashboard. If confirmation IS required, there's no session yet and
    // we show the "check your email" screen instead.
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <main className="max-w-sm mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold mb-3">Check your email</h1>
        <p className="text-ink-soft text-sm">
          We sent a confirmation link to <b>{email}</b>. Click it to activate your account, then come back and log in.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-widest text-ink-soft font-mono mb-1">
        Edu<span className="text-amber">matix</span>
      </div>
      <h1 className="font-serif text-2xl font-semibold mb-6">Create your account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name">
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputCls}
            placeholder="Jane Wanjiru"
          />
        </Field>
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
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="At least 6 characters"
          />
        </Field>

        {error && <p className="text-fail text-sm bg-fail-bg p-2.5 rounded-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-seal text-white font-mono text-xs uppercase tracking-wide py-3 rounded-sm hover:bg-[#734a22] disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="text-sm text-ink-soft mt-5 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-seal underline">
          Log in
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