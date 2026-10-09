// SERVER ONLY. One place that decides what is free and what needs activation.
import { createClient } from "@/lib/supabase/server";

// Change "free" <-> "paid" here to move a feature in or out of the paywall.
export const FEATURE_ACCESS = {
  calculator: "free",
  institutions: "free",
  career: "paid",
  tutor: "paid",
} as const;

export async function getAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, activated: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("activated")
    .eq("id", user.id)
    .single();

  return { user, activated: !!profile?.activated };
}
