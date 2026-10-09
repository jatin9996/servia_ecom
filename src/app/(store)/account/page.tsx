import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { inr } from "@/lib/pricing";
import { LogoutButton } from "@/components/auth/logout-button";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await readSession();
  if (!session) redirect("/login?next=/account");
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      addresses: true,
      orders: { orderBy: { createdAt: "desc" }, take: 8, include: { items: true } },
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="page py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-2 font-serif text-5xl tracking-tight">{user.name}</h1>
          <p className="mt-2 text-sm text-stone">{user.email}</p>
        </div>
        <div className="flex gap-3">
          {user.role === "ADMIN" ? <Link href="/admin" className="btn-line">Admin desk</Link> : null}
          <LogoutButton />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-line bg-ivory p-5">
          <p className="eyebrow">Seravia Points</p>
          <p className="mt-2 font-serif text-4xl">{user.points}</p>
          <p className="mt-1 text-xs text-stone">1 point = ₹1, up to 30% of an order. You earn 5% back.</p>
        </div>
        <div className="border border-line bg-ivory p-5">
          <p className="eyebrow">Orders</p>
          <p className="mt-2 font-serif text-4xl">{user.orders.length}</p>
        </div>
        <div className="border border-line bg-ivory p-5">
          <p className="eyebrow">Saved address</p>
          <p className="mt-2 text-sm leading-relaxed">
            {user.addresses[0]
              ? `${user.addresses[0].line1}, ${user.addresses[0].city} ${user.addresses[0].pincode}`
              : "Add one at checkout. It will be kept for next time."}
          </p>
        </div>
      </div>

      <h2 className="mt-12 font-serif text-3xl">Recent orders</h2>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {user.orders.length === 0 ? <p className="py-6 text-sm text-stone">No orders yet.</p> : null}
        {user.orders.map((order) => (
          <Link key={order.id} href={`/order/${order.orderNumber}`} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm hover:bg-sand/60">
            <span>
              <span className="block font-medium">{order.orderNumber}</span>
              <span className="text-stone">{order.items.map((item) => item.name).join(", ")}</span>
            </span>
            <span className="text-right">
              <span className="block">{inr(order.total)}</span>
              <span className="text-xs uppercase tracking-[0.14em] text-stone">{order.status}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
