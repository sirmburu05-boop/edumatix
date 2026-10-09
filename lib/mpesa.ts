// SERVER ONLY helpers for Safaricom Daraja STK Push.

const BASE =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

export function normalizePhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(d)) return "254" + d.slice(1);
  if (/^254[17]\d{8}$/.test(d)) return d;
  if (/^[17]\d{8}$/.test(d)) return "254" + d;
  return null;
}

async function getToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");
  const res = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Daraja auth failed (${res.status})`);
  const json = await res.json();
  return json.access_token as string;
}

// Daraja wants East Africa Time (UTC+3), format YYYYMMDDHHmmss
function timestamp(): string {
  const eat = new Date(Date.now() + 3 * 60 * 60 * 1000);
  return eat.toISOString().replace(/[-:T]/g, "").slice(0, 14);
}

function signing() {
  const ts = timestamp();
  const shortcode = process.env.MPESA_SHORTCODE!;
  const password = Buffer.from(
    `${shortcode}${process.env.MPESA_PASSKEY}${ts}`
  ).toString("base64");
  return { ts, shortcode, password };
}

export async function stkPush(opts: {
  phone: string;
  amount: number;
  accountRef: string;
  description: string;
}) {
  const token = await getToken();
  const { ts, shortcode, password } = signing();

  // Paybill: CustomerPayBillOnline, PartyB = shortcode.
  // Till (Buy Goods): CustomerBuyGoodsOnline, PartyB = till number.
  const body = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: ts,
    TransactionType: process.env.MPESA_TRANSACTION_TYPE || "CustomerPayBillOnline",
    Amount: Math.round(opts.amount),
    PartyA: opts.phone,
    PartyB: process.env.MPESA_PARTY_B || shortcode,
    PhoneNumber: opts.phone,
    CallBackURL: `${process.env.APP_BASE_URL}/api/mpesa/callback/${process.env.MPESA_CALLBACK_SECRET}`,
    AccountReference: opts.accountRef.slice(0, 12),
    TransactionDesc: opts.description.slice(0, 13),
  };

  const res = await fetch(`${BASE}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok || json.ResponseCode !== "0") {
    throw new Error(json.errorMessage || json.ResponseDescription || "STK push failed");
  }
  return json as { MerchantRequestID: string; CheckoutRequestID: string };
}

export type QueryResult = {
  state: "success" | "failed" | "pending";
  code?: number;
  desc?: string;
};

// Ask Safaricom directly what happened to an STK push (used when a callback is lost).
export async function stkQuery(checkoutRequestId: string): Promise<QueryResult> {
  const token = await getToken();
  const { ts, shortcode, password } = signing();

  const res = await fetch(`${BASE}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: ts,
      CheckoutRequestID: checkoutRequestId,
    }),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));

  // While the customer has not finished, Daraja answers with an error body
  // (no ResultCode) or code 4999 ("still being processed"). Treat both as pending.
  if (json.ResultCode === undefined || json.ResultCode === null) {
    return { state: "pending", desc: json.errorMessage || json.ResponseDescription };
  }
  const code = Number(json.ResultCode);
  if (code === 0) return { state: "success", code, desc: json.ResultDesc };
  if (code === 4999) return { state: "pending", code, desc: json.ResultDesc };
  return { state: "failed", code, desc: json.ResultDesc };
}
