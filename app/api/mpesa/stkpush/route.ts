import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone, stkPush } from "@/lib/mpesa";

const AMOUNT = Number(process.env.ACTIVATION_AMOUNT || 299);

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const { phone: rawPhone } = await req.json().catch(() => ({}));
  const phone = normalizePhone(String(rawPhone ?? ""));
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid Safaricom number, e.g. 0712345678." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("activated").eq("id", user.id).single();
  if (profile?.activated) return NextResponse.json({ error: "Already activated." }, { status: 400 });

  try {
    const r = await stkPush({
      phone,
      amount: AMOUNT,
      accountRef: "EDUMATIX",
      description: "Activation",
    });
    await admin.from("payments").insert({
      user_id: user.id,
      phone,
      amount: AMOUNT,
      merchant_request_id: r.MerchantRequestID,
      checkout_request_id: r.CheckoutRequestID,
      status: "pending",
    });
    return NextResponse.json({ checkoutRequestId: r.CheckoutRequestID });
  } catch (e) {
    console.error("STK push error:", e);
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 502 });
  }
}
