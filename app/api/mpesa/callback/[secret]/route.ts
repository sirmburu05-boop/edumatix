import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Safaricom calls this URL after the student enters (or cancels) their PIN.
// The secret in the path stops random people from faking a "payment success".
export async function POST(
  req: Request,
  { params }: { params: Promise<{ secret: string }> }
) {
  const { secret } = await params;
  if (!process.env.MPESA_CALLBACK_SECRET || secret !== process.env.MPESA_CALLBACK_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const cb = body?.Body?.stkCallback;
  if (!cb?.CheckoutRequestID) return NextResponse.json({ ResultCode: 0, ResultDesc: "ignored" });

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("id, user_id, amount, status")
    .eq("checkout_request_id", cb.CheckoutRequestID)
    .single();

  // Unknown or already-processed payment: acknowledge and do nothing (idempotent).
  if (!payment || payment.status !== "pending") {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "ok" });
  }

  if (cb.ResultCode === 0) {
    const items: { Name: string; Value?: string | number }[] = cb.CallbackMetadata?.Item ?? [];
    const get = (n: string) => items.find((i) => i.Name === n)?.Value;
    const paid = Number(get("Amount"));
    const receipt = String(get("MpesaReceiptNumber") ?? "");

    // Only activate if the amount paid matches what we asked for.
    if (paid >= Number(payment.amount)) {
      await admin.from("payments").update({
        status: "success", mpesa_receipt: receipt, result_code: 0,
        result_desc: cb.ResultDesc, completed_at: new Date().toISOString(),
      }).eq("id", payment.id);
      await admin.from("profiles").update({ activated: true }).eq("id", payment.user_id);
    } else {
      await admin.from("payments").update({
        status: "failed", result_code: 0,
        result_desc: `Amount mismatch: paid ${paid}`, completed_at: new Date().toISOString(),
      }).eq("id", payment.id);
    }
  } else {
    await admin.from("payments").update({
      status: cb.ResultCode === 1032 ? "cancelled" : "failed",
      result_code: cb.ResultCode, result_desc: cb.ResultDesc,
      completed_at: new Date().toISOString(),
    }).eq("id", payment.id);
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
