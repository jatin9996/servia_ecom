import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/pricing";
import { razorpayConfigured } from "@/server/checkout";
import { PayBalance } from "@/components/checkout/pay-balance";

export const metadata: Metadata = { title: "Order" };

type Address = {
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) notFound();
  const address = order.address as Address;

  return (
    <div className="page max-w-3xl py-12">
      <p className="eyebrow">{order.paymentStatus === "PENDING" ? "Payment pending" : "Order confirmed"}</p>
      <h1 className="mt-2 font-serif text-5xl tracking-tight">{order.orderNumber}</h1>
      <p className="mt-3 text-sm text-stone">
        {order.status} · {order.paymentMethod} · {order.paymentStatus}
      </p>
      {order.paymentStatus === "PENDING" ? (
        <PayBalance orderNumber={order.orderNumber} total={order.total} mode={razorpayConfigured() ? "razorpay" : "demo"} />
      ) : (
        <p className="mt-4 text-sm leading-relaxed">
          Dispatch within 24 working hours. Delivery in 3–6 days to {address.city}. A copy of this page is your receipt.
        </p>
      )}
      <div className="mt-8 border border-line">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between border-b border-line px-4 py-3 text-sm last:border-b-0">
            <span>{item.name} × {item.qty}</span>
            <span>{inr(item.price * item.qty)}</span>
          </div>
        ))}
        <div className="space-y-1 px-4 py-4 text-sm">
          <div className="flex justify-between"><span>Discount</span><span>{order.discount ? `−${inr(order.discount)}` : "—"}</span></div>
          <div className="flex justify-between"><span>Points</span><span>{order.pointsUsed ? `−${inr(order.pointsUsed)}` : "—"}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{order.shipping ? inr(order.shipping) : "Free"}</span></div>
          <div className="flex justify-between font-medium"><span>Total</span><span>{inr(order.total)}</span></div>
          {order.pointsEarned > 0 ? <p className="pt-2 text-xs text-stone">{order.pointsEarned} Seravia Points on this order.</p> : null}
        </div>
      </div>
      <div className="mt-6 text-sm leading-relaxed">
        <p className="eyebrow">Ship to</p>
        <p className="mt-2">{address.fullName}</p>
        <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
        <p>{address.city}, {address.state} {address.pincode}</p>
        <p>{address.phone}</p>
        <p className="text-stone">{order.email}</p>
      </div>
      <Link href="/shop" className="btn mt-8">Continue shopping</Link>
    </div>
  );
}
