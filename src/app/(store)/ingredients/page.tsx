import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Ingredients" };

export default async function IngredientsPage() {
  const ingredients = await prisma.ingredient.findMany({
    include: { product: true },
    orderBy: { name: "asc" },
  });
  const groups = new Map<string, { concentration: string; benefit: string; products: { slug: string; name: string }[] }>();
  for (const item of ingredients) {
    const current = groups.get(item.name) ?? { concentration: item.concentration, benefit: item.benefit, products: [] };
    current.products.push({ slug: item.product.slug, name: item.product.name });
    groups.set(item.name, current);
  }

  return (
    <div className="page py-12">
      <p className="eyebrow">Ingredient index</p>
      <h1 className="mt-2 max-w-2xl font-serif text-5xl tracking-tight">Every named active, with the dose on the bottle.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/75">
        Tap through to the formula. Concentrations are cosmetic strengths, disclosed so you can compare them with your dermatologist — not so a label can sound louder.
      </p>
      <div className="mt-10 divide-y divide-line border-y border-line">
        {[...groups.entries()].map(([name, group]) => (
          <article key={name} className="grid gap-3 py-5 md:grid-cols-[220px_1fr]">
            <h2 className="font-serif text-2xl">{name}</h2>
            <div>
              <p className="text-sm leading-relaxed text-ink/80">{group.benefit}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-stone">Seen at {group.concentration}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                {group.products.map((product) => (
                  <Link key={product.slug} href={`/shop/${product.slug}`} className="underline">
                    {product.name}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
