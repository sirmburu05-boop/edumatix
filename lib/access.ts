// SERVER ONLY. One place that describes how each feature behaves.
//   "free"   : fully open to everyone
//   "teaser" : everyone can use the page, but RESULTS are hidden until activated
//              (the server withholds the data, it is not just blurred)
//   "paid"   : the page itself needs activation
import { createClient } from "@/lib/supabase/server";

export const FEATURE_ACCESS = {
  calculator: "teaser",
  institutions: "free", // will become a teaser (hidden cutoffs/programmes) in the next step
  career: "paid",       // will become a teaser when Career Guidance is built
  tutor: "paid",        // will become a teaser when the AI Tutor is built
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
