import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { toCard } from "@/lib/dto";
import { ProductCard } from "@/components/product/card";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const products = query
    ? await prisma.product.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { concernLine: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { ingredients: { some: { name: { contains: query, mode: "insensitive" } } } },
          ],
        },
        orderBy: { featured: "asc" },
      })
    : [];

  return (
    <div className="page py-12">
      <p className="eyebrow">Search</p>
      <h1 className="mt-2 font-serif text-5xl tracking-tight">{query ? `Results for “${query}”` : "Search the range"}</h1>
      <p className="mt-3 text-sm text-stone">{query ? `${products.length} formulas` : "Try niacinamide, sunscreen, acne or barrier."}</p>
      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={toCard(product)} />
        ))}
      </div>
    </div>
  );
}
