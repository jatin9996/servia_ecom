import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/pricing";

export default async function AdminHome() {
  const [orders, products, inquiries, customers] = await Promise.all([
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ orderBy: { stock: "asc" } }),
    prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const live = orders.filter((order) => order.status !== "CANCELLED" && ["PAID", "COD"].includes(order.paymentStatus));
  const revenue = live.reduce((sum, order) => sum + order.total, 0);
  const low = products.filter((product) => product.stock < 12);

  const days = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const total = live
      .filter((order) => order.createdAt >= day && order.createdAt < next)
      .reduce((sum, order) => sum + order.total, 0);
    return { label: day.toLocaleDateString("en-IN", { weekday: "short" }), total };
  });
  const max = Math.max(...days.map((day) => day.total), 1);

  return (
    <div>
      <p className="eyebrow">Today</p>
      <h1 className="mt-2 font-serif text-4xl">The desk</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Revenue", inr(revenue)],
          ["Open orders", String(orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status)).length)],
          ["Customers", String(customers)],
          ["Low stock", String(low.length)],
        ].map(([label, value]) => (
          <div key={label} className="border border-line bg-ivory p-4">
            <p className="eyebrow">{label}</p>
            <p className="mt-2 font-serif text-3xl">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 border border-line bg-ivory p-5">
        <p className="eyebrow">Seven days</p>
        <div className="mt-4 flex h-36 items-end gap-3">
          {days.map((day) => (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full bg-sand" style={{ height: `${Math.max(8, (day.total / max) * 112)}px` }}>
                <div className="h-full bg-sage" style={{ opacity: day.total ? 1 : 0.25 }} />
              </div>
              <span className="text-[11px] uppercase tracking-wider text-stone">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm underline">All</Link>
          </div>
          <div className="mt-3 divide-y divide-line border-y border-line">
            {orders.slice(0, 6).map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex justify-between py-3 text-sm">
                <span>
                  <span className="block">{order.orderNumber}</span>
                  <span className="text-xs text-stone">{order.status}</span>
                </span>
                <span>{inr(order.total)}</span>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-serif text-2xl">Needs a look</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {low.map((product) => (
              <li key={product.id} className="flex justify-between border-b border-line pb-2">
                <Link href={`/admin/products/${product.id}`} className="underline">{product.name}</Link>
                <span className="text-clay">{product.stock} left</span>
              </li>
            ))}
            {inquiries.map((inquiry) => (
              <li key={inquiry.id} className="border-b border-line pb-2">
                <span className="text-xs uppercase tracking-[0.14em] text-stone">{inquiry.topic}</span>
                <p>{inquiry.name} — {inquiry.message.slice(0, 90)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
