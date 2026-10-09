import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { categoryName, concernBySlug } from "@/lib/catalog";
import { inr } from "@/lib/pricing";
import { toCard } from "@/lib/dto";
import { Bottle } from "@/components/product/bottle";
import { Stars } from "@/components/product/stars";
import { AddToBag } from "@/components/product/add-to-bag";
import { ProductCard } from "@/components/product/card";
import { ReviewForm } from "@/components/product/review-form";
import { IngredientList } from "@/components/product/ingredients";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Formula" };
  return { title: product.name, description: product.concernLine };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      ingredients: { orderBy: { sort: "asc" } },
      reviews: { where: { published: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!product || !product.active) notFound();

  const pairs = await prisma.product.findMany({
    where: { slug: { in: product.pairsWith }, active: true },
  });

  return (
    <div>
      <div className="grid lg:grid-cols-2">
        <div className="grid min-h-[520px] place-items-center bg-sand px-6 py-12">
          <Bottle accent={product.accent} mark={product.mark} size={360} title={product.name} />
        </div>
        <div className="px-5 py-10 lg:px-12 lg:py-14">
          <p className="eyebrow">{product.badge ?? categoryName(product.category)} · {product.whenToUse}</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-3 text-stone">{product.concernLine}</p>
          <div className="mt-4">
            {product.ratingCount > 0 ? <Stars value={product.ratingAvg} count={product.ratingCount} /> : null}
          </div>
          <p className="mt-5 text-lg">
            {inr(product.price)}
            {product.mrp > product.price ? <span className="ml-2 text-sm text-stone line-through">{inr(product.mrp)}</span> : null}
            <span className="ml-3 text-sm text-stone">{product.size}</span>
          </p>
          <p className="mt-1 text-xs text-stone">Inclusive of GST · HSN 3304</p>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-ink/80">{product.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.concerns.map((slug) => {
              const concern = concernBySlug(slug);
              return concern ? (
                <Link key={slug} href={`/concern/${slug}`} className="border border-line px-2 py-1 text-[11px] uppercase tracking-[0.14em]">
                  {concern.name}
                </Link>
              ) : null;
            })}
          </div>
          <p className="mt-4 text-xs text-stone">Suited to {product.skinTypes.join(", ")}</p>
          <div className="mt-6 max-w-md">
            <AddToBag product={toCard(product)} />
          </div>
        </div>
      </div>

      <section className="page grid gap-10 py-14 lg:grid-cols-2">
        <div>
          <p className="eyebrow">From the founding desk</p>
          <h2 className="mt-2 font-serif text-3xl">Why this formula exists</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/80">{product.doctorNote}</p>
        </div>
        <div>
          <p className="eyebrow">How to use</p>
          <h2 className="mt-2 font-serif text-3xl">{product.whenToUse}</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/80">{product.howToUse}</p>
        </div>
      </section>

      <section className="page pb-14">
        <p className="eyebrow">Full disclosure</p>
        <h2 className="mt-2 font-serif text-3xl">What is in it, and why</h2>
        <div className="mt-6">
          <IngredientList ingredients={product.ingredients.map((item) => ({ name: item.name, concentration: item.concentration, benefit: item.benefit }))} />
        </div>
      </section>

      <section className="page pb-14">
        <p className="eyebrow">Wear notes</p>
        <h2 className="mt-2 font-serif text-3xl">Reviews</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {product.reviews.length === 0 ? <p className="text-sm text-stone">No published notes yet.</p> : null}
            {product.reviews.map((review) => (
              <article key={review.id} className="border border-line bg-ivory p-5">
                <Stars value={review.rating} />
                <h3 className="mt-2 font-serif text-2xl">{review.title}</h3>
                <p className="mt-2 text-sm leading-relaxed">{review.body}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-stone">
                  {review.author} · {review.ageRange} · {review.skinType} · {review.concern}
                  {review.verified ? " · Verified purchase" : ""}
                </p>
              </article>
            ))}
          </div>
          <ReviewForm productId={product.id} />
        </div>
      </section>

      {pairs.length > 0 ? (
        <section className="page pb-16">
          <p className="eyebrow">Use alongside</p>
          <h2 className="mt-2 font-serif text-3xl">Pairs with</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {pairs.map((item) => (
              <ProductCard key={item.id} product={toCard(item)} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
