import { prisma } from "@/lib/prisma";

export default async function CustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <p className="eyebrow">People</p>
      <h1 className="mt-2 font-serif text-4xl">Customers</h1>
      <div className="mt-6 overflow-auto border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-sand text-[11px] uppercase tracking-[0.14em] text-stone">
            <tr>
              <th className="px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Email</th>
              <th className="px-3 py-3 font-medium">Points</th>
              <th className="px-3 py-3 font-medium">Orders</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-line">
                <td className="px-3 py-3">{customer.name}</td>
                <td className="px-3 py-3">{customer.email}</td>
                <td className="px-3 py-3">{customer.points}</td>
                <td className="px-3 py-3">{customer._count.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
