import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/pricing";
import { OrderStatus } from "@/components/admin/order-status";

type Address = {
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  const address = order.address as Address;
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">Order</p>
      <h1 className="mt-2 font-serif text-4xl">{order.orderNumber}</h1>
      <p className="mt-2 text-sm text-stone">{order.email} · {order.paymentMethod} · {order.paymentStatus}</p>
      {order.razorpayPaymentId ? <p className="text-xs text-stone">Payment id {order.razorpayPaymentId}</p> : null}
      <div className="mt-6"><OrderStatus id={order.id} status={order.status} /></div>
      <div className="mt-6 border border-line">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between border-b border-line px-4 py-3 text-sm">
            <span>{item.name} × {item.qty}</span>
            <span>{inr(item.price * item.qty)}</span>
          </div>
        ))}
        <div className="space-y-1 px-4 py-4 text-sm">
          <div className="flex justify-between"><span>Discount {order.couponCode ?? ""}</span><span>{inr(order.discount)}</span></div>
          <div className="flex justify-between"><span>Points</span><span>{inr(order.pointsUsed)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{inr(order.shipping)}</span></div>
          <div className="flex justify-between font-medium"><span>Total</span><span>{inr(order.total)}</span></div>
        </div>
      </div>
      <div className="mt-6 text-sm">
        <p>{address.fullName} · {address.phone}</p>
        <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
        <p>{address.city}, {address.state} {address.pincode}</p>
        {order.note ? <p className="mt-2 text-stone">Note: {order.note}</p> : null}
      </div>
    </div>
  );
}
