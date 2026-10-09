// SERVER ONLY. Shared logic for settling payments and recovering lost callbacks.
import type { SupabaseClient } from "@supabase/supabase-js";
import { stkQuery } from "@/lib/mpesa";

type Outcome = {
  status: "success" | "failed" | "cancelled";
  receipt?: string | null;
  code?: number;
  desc?: string;
};

// Idempotent: only a payment that is still "pending" can be settled, so the
// callback and the safety net can both run without double-processing.
async function settle(admin: SupabaseClient, paymentId: number, userId: string, o: Outcome) {
  const { data: updated } = await admin
    .from("payments")
    .update({
      status: o.status,
      mpesa_receipt: o.receipt ?? null,
      result_code: o.code ?? null,
      result_desc: o.desc ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .eq("status", "pending")
    .select("id");

  if (updated && updated.length > 0 && o.status === "success") {
    await admin.from("profiles").update({ activated: true }).eq("id", userId);
    return true;
  }
  return false;
}

// Checks this student's pending payments (from the last 24 hours) directly with
// Safaricom. Returns true if any of them turned out to be successful.
export async function reconcilePayments(
  admin: SupabaseClient,
  userId: string,
  onlyIds?: number[]
): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let q = admin
    .from("payments")
    .select("id, checkout_request_id")
    .eq("user_id", userId)
    .eq("status", "pending")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5);
  if (onlyIds && onlyIds.length) q = q.in("id", onlyIds);

  const { data: rows } = await q;
  let activated = false;

  for (const row of rows ?? []) {
    if (!row.checkout_request_id) continue;
    try {
      const r = await stkQuery(row.checkout_request_id);
      if (r.state === "pending") continue;
      if (r.state === "success") {
        // The query does not return a receipt number; the callback path does.
        if (await settle(admin, row.id, userId, { status: "success", code: 0, desc: r.desc })) {
          activated = true;
        }
      } else {
        await settle(admin, row.id, userId, {
          status: r.code === 1032 ? "cancelled" : "failed",
          code: r.code,
          desc: r.desc,
        });
      }
    } catch (e) {
      console.error("reconcile error:", e);
    }
  }
  return activated;
}
