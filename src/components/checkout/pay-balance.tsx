"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inr } from "@/lib/pricing";

export function PayBalance({
  orderNumber,
  total,
  mode,
}: {
  orderNumber: string;
  total: number;
  mode: "demo" | "razorpay";
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function pay() {
    setPending(true);
    setError("");
    if (mode === "demo") {
      const response = await fetch("/api/payments/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      setPending(false);
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Payment failed.");
        return;
      }
      router.refresh();
      return;
    }
    setPending(false);
    setError("Open checkout again to pay with Razorpay, or contact care@seravia.life with this order number.");
  }

  return (
    <div className="mt-6 border border-clay/40 bg-ivory p-4">
      <p className="text-sm">This order is waiting for payment.</p>
      <button type="button" className="btn mt-3" disabled={pending} onClick={() => void pay()}>
        {pending ? "Confirming…" : `Pay ${inr(total)}`}
      </button>
      {error ? <p className="mt-2 text-sm text-clay">{error}</p> : null}
    </div>
  );
}
