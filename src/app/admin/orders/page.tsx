import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/pricing";

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } });
  return (
    <div>
      <p className="eyebrow">Fulfilment</p>
      <h1 className="mt-2 font-serif text-4xl">Orders</h1>
      <div className="mt-6 overflow-auto border border-line">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-sand text-[11px] uppercase tracking-[0.14em] text-stone">
            <tr>
              <th className="px-3 py-3 font-medium">Order</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Payment</th>
              <th className="px-3 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="px-3 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="underline">{order.orderNumber}</Link>
                  <span className="block text-xs text-stone">{order.createdAt.toLocaleDateString("en-IN")}</span>
                </td>
                <td className="px-3 py-3">{order.email}</td>
                <td className="px-3 py-3">{order.status}</td>
                <td className="px-3 py-3">{order.paymentMethod} · {order.paymentStatus}</td>
                <td className="px-3 py-3">{inr(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
