import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The activate page polls this to see whether the payment went through.
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  // RLS guarantees a student can only read their own payments.
  const { data } = await supabase
    .from("payments")
    .select("status, result_desc")
    .eq("checkout_request_id", id)
    .single();

  return NextResponse.json({ status: data?.status ?? "pending", message: data?.result_desc ?? null });
}
