import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, CONCERNS, SKIN_TYPES } from "@/lib/catalog";
import { toCard } from "@/lib/dto";
import { ProductCard } from "@/components/product/card";

export const metadata: Metadata = { title: "Shop" };

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const concern = one(params.concern);
  const category = one(params.category);
  const skin = one(params.skin);
  const sort = one(params.sort) ?? "featured";

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category } : {}),
      ...(concern ? { concerns: { has: concern } } : {}),
      ...(skin ? { skinTypes: { has: skin } } : {}),
    },
  });

  const sorted = [...products].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.ratingAvg - a.ratingAvg;
    return a.featured - b.featured;
  });

  const chips = [
    { href: "/shop", label: "All", active: !concern && !category && !skin },
    ...CATEGORIES.map((item) => ({
      href: `/shop?category=${item.slug}`,
      label: item.name,
      active: category === item.slug,
    })),
  ];

  return (
    <div className="page py-10">
      <p className="eyebrow">The range</p>
      <h1 className="mt-2 font-serif text-5xl tracking-tight">Shop formulas</h1>
      <p className="mt-3 max-w-xl text-sm text-ink/70">
        Named actives, stated concentrations, made for pigmentation, acne, barrier stress and Indian sun.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Link key={chip.href} href={chip.href} className={`border px-3 py-2 text-xs uppercase tracking-[0.14em] ${chip.active ? "border-ink bg-ink text-ivory" : "border-line"}`}>
            {chip.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {CONCERNS.map((item) => (
          <Link key={item.slug} href={`/shop?concern=${item.slug}`} className={`text-xs underline-offset-4 ${concern === item.slug ? "underline" : "text-stone hover:text-ink"}`}>
            {item.name}
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {SKIN_TYPES.map((item) => (
          <Link key={item} href={`/shop?skin=${encodeURIComponent(item)}`} className={`border px-2 py-1 text-xs ${skin === item ? "border-ink" : "border-line text-stone"}`}>
            {item}
          </Link>
        ))}
        <span className="mx-2 text-line">|</span>
        {[
          ["featured", "Featured"],
          ["price-asc", "Price ↑"],
          ["price-desc", "Price ↓"],
          ["rating", "Top rated"],
        ].map(([key, label]) => (
          <Link key={key} href={`/shop?sort=${key}${category ? `&category=${category}` : ""}${concern ? `&concern=${concern}` : ""}`} className={`text-xs ${sort === key ? "text-ink" : "text-stone"}`}>
            {label}
          </Link>
        ))}
      </div>

      <p className="mt-8 text-xs uppercase tracking-[0.16em] text-stone">{sorted.length} formulas</p>
      {sorted.length === 0 ? (
        <p className="mt-6 font-serif text-3xl">Nothing in this filter. <Link href="/shop" className="underline">Clear it</Link>.</p>
      ) : (
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={toCard(product)} />
          ))}
        </div>
      )}
    </div>
  );
}
