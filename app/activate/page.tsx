"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Stage = "idle" | "sending" | "waiting" | "success" | "failed";

export default function ActivatePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function goToDashboard() {
    setStage("success");
    setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1500);
  }

  // Safety net: if the student paid earlier but the confirmation was lost, recover it.
  async function recheck(silent: boolean) {
    if (!silent) { setChecking(true); setMessage(""); }
    const res = await fetch("/api/mpesa/reconcile", { method: "POST" });
    const j = await res.json().catch(() => ({}));
    if (j.activated) { goToDashboard(); return; }
    if (!silent) {
      setChecking(false);
      setMessage("No completed payment found yet. If you just paid, wait a minute and try again.");
    }
  }

  useEffect(() => {
    recheck(true);
    return () => { if (timer.current) clearInterval(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function poll(id: string) {
    let tries = 0;
    timer.current = setInterval(async () => {
      tries++;
      // From ~15 seconds on, every 5th poll also asks Safaricom directly.
      const verify = tries >= 5 && tries % 5 === 0 ? "&verify=1" : "";
      const res = await fetch(`/api/mpesa/status?id=${encodeURIComponent(id)}${verify}`);
      const j = await res.json().catch(() => ({}));
      if (j.status === "success") {
        clearInterval(timer.current!);
        goToDashboard();
      } else if (j.status === "failed" || j.status === "cancelled") {
        clearInterval(timer.current!);
        setStage("failed");
        setMessage(j.status === "cancelled" ? "You cancelled the payment." : (j.message || "Payment failed."));
      } else if (tries >= 40) {
        clearInterval(timer.current!);
        setStage("failed");
        setMessage("We have not received confirmation yet. If money was deducted, press Check my payment below.");
      }
    }, 3000);
  }

  async function pay(e: React.MouseEvent) {
    e.preventDefault();
    setStage("sending"); setMessage("");
    const res = await fetch("/api/mpesa/stkpush", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setStage("failed"); setMessage(j.error || "Something went wrong."); return; }
    setStage("waiting");
    poll(j.checkoutRequestId);
  }

  return (
    <main className="max-w-md mx-auto px-6 py-10">
      <div className="text-xs uppercase tracking-widest text-ink-soft font-mono mb-1">
        Edu<span className="text-amber">matix</span> · Activation
      </div>
      <h1 className="font-serif text-2xl font-semibold mb-2">Activate for KSh 299</h1>
      <p className="text-sm text-ink-soft mb-6">
        One-time payment via M-Pesa. Enter your Safaricom number and approve the prompt on your phone.
      </p>

      {(stage === "idle" || stage === "failed" || stage === "sending") && (
        <div className="space-y-3">
          <input
            type="tel" inputMode="tel" placeholder="0712 345 678" value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-paper-line rounded-sm px-3 py-2.5 bg-white font-mono"
          />
          <button
            onClick={pay} disabled={stage === "sending" || phone.length < 9}
            className="w-full bg-seal text-white font-mono text-sm uppercase tracking-wide px-5 py-3 rounded-sm disabled:opacity-50"
          >
            {stage === "sending" ? "Sending prompt..." : "Pay KSh 299 with M-Pesa"}
          </button>
          {message && <p className="text-sm text-red-700">{message}</p>}
        </div>
      )}

      {stage === "waiting" && (
        <div className="bg-[#fff8ea] border border-amber rounded-sm p-5 text-sm">
          <b>Check your phone.</b> Enter your M-Pesa PIN to complete the payment. This page updates automatically.
        </div>
      )}

      {stage === "success" && (
        <div className="bg-pass-bg border border-pass rounded-sm p-5 text-sm text-pass font-semibold">
          Payment received. Your account is activated. Redirecting...
        </div>
      )}

      {stage !== "success" && stage !== "waiting" && (
        <div className="mt-8 pt-5 border-t border-paper-line text-sm">
          <p className="text-ink-soft mb-2">Already paid but not activated?</p>
          <button
            onClick={() => recheck(false)} disabled={checking}
            className="border border-paper-line bg-white font-mono text-xs uppercase tracking-wide px-4 py-2 rounded-sm hover:border-seal disabled:opacity-50"
          >
            {checking ? "Checking..." : "Check my payment"}
          </button>
        </div>
      )}
    </main>
  );
}
