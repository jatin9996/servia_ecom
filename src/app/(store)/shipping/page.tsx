import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <article className="page max-w-3xl py-14">
      <p className="eyebrow">Help</p>
      <h1 className="mt-2 font-serif text-5xl">Shipping</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/80">
        <p>Orders placed before 2 pm IST on a working day leave our fulfilment desk the same day. Delivery across India is typically 3–6 days.</p>
        <p>Shipping is free on merchandise of ₹499 or more. Below that, a flat ₹49 covers dispatch.</p>
        <p>Cash on delivery is available at checkout. Prepaid orders use Seravia Pay — UPI, cards, netbanking and wallets — settled through Razorpay when live keys are connected.</p>
        <p>Prices include GST under HSN 3304. You will see the tax portion on the order summary.</p>
      </div>
    </article>
  );
}
