import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reconcilePayments } from "@/lib/payments";

// For a student who paid but closed the page: re-check all their pending payments.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const activated = await reconcilePayments(createAdminClient(), user.id);
  return NextResponse.json({ activated });
}
