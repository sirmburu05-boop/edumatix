import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reconcilePayments } from "@/lib/payments";

// The activate page polls this. Every few polls it adds ?verify=1, which makes
// the server ask Safaricom directly in case the callback was lost.
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const verify = url.searchParams.get("verify") === "1";
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const read = () =>
    supabase
      .from("payments")
      .select("id, status, result_desc")
      .eq("checkout_request_id", id)
      .single();

  let { data } = await read(); // RLS: students only see their own payments

  if (data && data.status === "pending" && verify) {
    await reconcilePayments(createAdminClient(), user.id, [data.id]);
    ({ data } = await read());
  }

  return NextResponse.json({ status: data?.status ?? "pending", message: data?.result_desc ?? null });
}
