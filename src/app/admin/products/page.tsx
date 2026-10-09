import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/pricing";

export default async function AdminProducts() {
  const products = await prisma.product.findMany({ orderBy: { featured: "asc" } });
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="mt-2 font-serif text-4xl">Formulas</h1>
        </div>
        <Link href="/admin/products/new" className="btn">New formula</Link>
      </div>
      <div className="mt-6 overflow-auto border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-sand text-[11px] uppercase tracking-[0.14em] text-stone">
            <tr>
              <th className="px-3 py-3 font-medium">Formula</th>
              <th className="px-3 py-3 font-medium">SKU</th>
              <th className="px-3 py-3 font-medium">Price</th>
              <th className="px-3 py-3 font-medium">Stock</th>
              <th className="px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-line">
                <td className="px-3 py-3">
                  <Link href={`/admin/products/${product.id}`} className="underline">{product.name}</Link>
                  <span className="block text-xs text-stone">{product.concernLine}</span>
                </td>
                <td className="px-3 py-3">{product.sku}</td>
                <td className="px-3 py-3">{inr(product.price)}</td>
                <td className={`px-3 py-3 ${product.stock < 12 ? "text-clay" : ""}`}>{product.stock}</td>
                <td className="px-3 py-3">{product.active ? "Live" : "Hidden"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
