"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="text-xs font-mono uppercase tracking-wide text-ink-soft border border-paper-line px-3 py-2 rounded-sm hover:border-seal"
    >
      Sign out
    </button>
  );
}
