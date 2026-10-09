"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { STATES } from "@/lib/catalog";
import { inr, quote, type CouponRule } from "@/lib/pricing";
import { useAuth } from "@/components/auth/auth-context";
import { useCart } from "@/components/cart/cart-context";

type Address = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function CheckoutForm({ saved }: { saved: Address | null }) {
  const { items, subtotal, clear, ready } = useCart();
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [coupon, setCoupon] = useState<CouponRule | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponNote, setCouponNote] = useState("");
  const [usePoints, setUsePoints] = useState(false);
  const [method, setMethod] = useState<"ONLINE" | "COD">("ONLINE");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [demo, setDemo] = useState<{ orderNumber: string; total: number } | null>(null);
  const [payTab, setPayTab] = useState<"UPI" | "Card" | "Netbanking" | "Wallet">("UPI");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const priced = useMemo(
    () =>
      quote({
        subtotal,
        coupon,
        pointsRequested: usePoints ? user?.points ?? 0 : 0,
        pointsAvailable: user?.points ?? 0,
      }),
    [subtotal, coupon, usePoints, user?.points],
  );

  async function applyCoupon() {
    setCouponNote("");
    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, subtotal }),
    });
    const data = (await response.json()) as { error?: string; coupon?: CouponRule };
    if (!response.ok || !data.coupon) {
      setCoupon(null);
      setCouponNote(data.error ?? "Code not applied.");
      return;
    }
    setCoupon(data.coupon);
    setCouponNote(`${data.coupon.code} applied.`);
  }

  async function place(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
        email: form.get("email"),
        note: form.get("note"),
        couponCode: coupon?.code,
        pointsToUse: usePoints ? user?.points ?? 0 : 0,
        paymentMethod: method,
        address: {
          fullName: form.get("fullName"),
          phone: form.get("phone"),
          line1: form.get("line1"),
          line2: form.get("line2"),
          city: form.get("city"),
          state: form.get("state"),
          pincode: form.get("pincode"),
        },
      }),
    });
    const data = (await response.json()) as {
      error?: string;
      mode?: string;
      orderNumber?: string;
      key?: string;
      amount?: number;
      currency?: string;
      razorpayOrderId?: string | null;
      total?: number;
    };
    setPending(false);
    if (!response.ok || !data.orderNumber) {
      setError(data.error ?? "Checkout could not start.");
      return;
    }

    if (data.mode === "cod") {
      clear();
      await refresh();
      router.push(`/order/${data.orderNumber}`);
      return;
    }

    if (data.mode === "razorpay" && data.razorpayOrderId && window.Razorpay) {
      const checkout = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Seravia",
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: String(form.get("fullName") ?? ""),
          email: String(form.get("email") ?? ""),
          contact: String(form.get("phone") ?? ""),
        },
        theme: { color: "#9C4221" },
        handler: async (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderNumber: data.orderNumber, ...payload }),
          });
          if (!verify.ok) {
            setError("Payment reached Razorpay but could not be confirmed. Keep the payment id and contact care@seravia.life.");
            return;
          }
          clear();
          await refresh();
          router.push(`/order/${data.orderNumber}`);
        },
      });
      checkout.open();
      return;
    }

    setDemo({ orderNumber: data.orderNumber, total: data.total ?? priced.total });
  }

  async function confirmDemo() {
    if (!demo) return;
    setPending(true);
    const response = await fetch("/api/payments/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber: demo.orderNumber }),
    });
    setPending(false);
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Sandbox payment failed.");
      return;
    }
    clear();
    await refresh();
    router.push(`/order/${demo.orderNumber}`);
  }

  if (!ready) return <p className="text-sm text-stone">Preparing checkout…</p>;
  if (items.length === 0) return <p className="font-serif text-3xl">Your bag is empty.</p>;

  return (
    <>
      <form onSubmit={place} className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <h2 className="font-serif text-2xl">Delivery</h2>
          <label className="label">Email</label>
          <input name="email" type="email" required defaultValue={user?.email ?? ""} className="field" />
          <label className="label">Full name</label>
          <input name="fullName" required defaultValue={saved?.fullName ?? user?.name ?? ""} className="field" />
          <label className="label">Phone</label>
          <input name="phone" required defaultValue={saved?.phone ?? ""} className="field" inputMode="numeric" />
          <label className="label">Address</label>
          <input name="line1" required defaultValue={saved?.line1 ?? ""} className="field" />
          <input name="line2" defaultValue={saved?.line2 ?? ""} className="field mt-2" placeholder="Apartment, landmark" />
          <div className="grid gap-3 sm:grid-cols-3">
            <input name="city" required defaultValue={saved?.city ?? ""} className="field" placeholder="City" />
            <select name="state" defaultValue={saved?.state ?? "Karnataka"} className="field">
              {STATES.map((state) => <option key={state}>{state}</option>)}
            </select>
            <input name="pincode" required defaultValue={saved?.pincode ?? ""} className="field" placeholder="Pincode" inputMode="numeric" />
          </div>
          <label className="label">Note for the desk</label>
          <input name="note" className="field" placeholder="Optional" />

          <h2 className="pt-4 font-serif text-2xl">Pay</h2>
          <label className="flex items-start gap-3 border border-line bg-ivory p-4">
            <input type="radio" name="pay" checked={method === "ONLINE"} onChange={() => setMethod("ONLINE")} />
            <span>
              <span className="block text-sm">UPI, cards, netbanking, wallets</span>
              <span className="block text-xs text-stone">Seravia Pay. Razorpay when live keys are set, otherwise a sandbox.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 border border-line bg-ivory p-4">
            <input type="radio" name="pay" checked={method === "COD"} onChange={() => setMethod("COD")} />
            <span>
              <span className="block text-sm">Cash on delivery</span>
              <span className="block text-xs text-stone">Pay the courier when the parcel arrives. No extra fee.</span>
            </span>
          </label>
          {error ? <p className="text-sm text-clay">{error}</p> : null}
          <button className="btn w-full" disabled={pending}>
            {pending ? "Placing order…" : method === "COD" ? `Place COD order · ${inr(priced.total)}` : `Pay ${inr(priced.total)}`}
          </button>
        </div>

        <aside className="h-fit border border-line bg-ivory p-5">
          <h2 className="font-serif text-2xl">Summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-3">
                <span>{item.name} × {item.qty}</span>
                <span>{inr(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder="Code" className="field" />
            <button type="button" className="btn-line" onClick={() => void applyCoupon()}>Apply</button>
          </div>
          {couponNote ? <p className="mt-2 text-xs text-stone">{couponNote}</p> : null}
          {user && user.points > 0 ? (
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={usePoints} onChange={(event) => setUsePoints(event.target.checked)} />
              Use Seravia Points ({user.points} available, up to 30% of the order)
            </label>
          ) : (
            <p className="mt-4 text-xs text-stone">Sign in to earn and spend Seravia Points. 1 point = ₹1.</p>
          )}
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Discount</dt><dd>{priced.discount ? `−${inr(priced.discount)}` : "—"}</dd></div>
            <div className="flex justify-between"><dt>Points</dt><dd>{priced.pointsUsed ? `−${inr(priced.pointsUsed)}` : "—"}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{priced.shipping ? inr(priced.shipping) : "Free"}</dd></div>
            <div className="flex justify-between"><dt>GST included</dt><dd>{inr(priced.gst)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 font-medium"><dt>Total</dt><dd>{inr(priced.total)}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-stone">You will earn {priced.pointsEarned} points on this order if you are signed in.</p>
        </aside>
      </form>

      {demo ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 px-4">
          <div className="w-full max-w-md bg-paper p-6 shadow-sheet">
            <p className="eyebrow">Seravia Pay · Sandbox</p>
            <h3 className="mt-2 font-serif text-3xl">Pay {inr(demo.total)}</h3>
            <p className="mt-2 text-sm text-stone">
              No real charge. Add Razorpay keys to accept live UPI, cards, netbanking and wallets. This sandbox uses the same method list.
            </p>
            <div className="mt-4 flex gap-2 text-xs">
              {(["UPI", "Card", "Netbanking", "Wallet"] as const).map((tab) => (
                <button key={tab} type="button" onClick={() => setPayTab(tab)} className={`border px-2 py-1 ${payTab === tab ? "border-ink bg-ink text-ivory" : "border-line"}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="mt-4">
              {payTab === "UPI" ? <input className="field" defaultValue="success@upi" aria-label="UPI id" /> : null}
              {payTab === "Card" ? (
                <div className="space-y-2">
                  <input className="field" defaultValue="4111 1111 1111 1111" aria-label="Card number" />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="field" defaultValue="12 / 30" aria-label="Expiry" />
                    <input className="field" defaultValue="123" aria-label="CVV" />
                  </div>
                </div>
              ) : null}
              {payTab === "Netbanking" ? (
                <select className="field" defaultValue="State Bank of India">
                  <option>State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                </select>
              ) : null}
              {payTab === "Wallet" ? (
                <select className="field" defaultValue="Seravia sandbox wallet">
                  <option>Seravia sandbox wallet</option>
                </select>
              ) : null}
            </div>
            <button type="button" className="btn mt-4 w-full" disabled={pending} onClick={() => void confirmDemo()}>
              {pending ? "Confirming…" : `Pay ${inr(demo.total)}`}
            </button>
            <button type="button" className="mt-3 w-full text-xs text-stone" onClick={() => setDemo(null)}>
              Close and pay later from the order page
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
