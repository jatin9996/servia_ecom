import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CONCERNS } from "@/lib/catalog";
import { toCard } from "@/lib/dto";
import { ProductCard } from "@/components/product/card";
import { Bottle } from "@/components/product/bottle";
import { Stars } from "@/components/product/stars";

const principles = [
  { title: "Transparency", copy: "Every active is named with its concentration. No proprietary blends hiding the dose." },
  { title: "Clinical focus", copy: "Formulas are built around a concern, not a trend. Short routines, stated strengths." },
  { title: "Indian climate", copy: "Humidity, hard water, pollution and melanin-rich skin are the brief — not an afterthought." },
  { title: "Honest prices", copy: "A complete morning and night routine should not require a luxury budget." },
];

export default async function HomePage() {
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { featured: "asc" } });
  const bestsellers = products.filter((product) => product.badge === "Bestseller").slice(0, 4);
  const hero = products.filter((product) => ["vitamin-c-15", "spf-50-fluid", "niacinamide-10-zinc"].includes(product.slug));
  const reviews = await prisma.review.findMany({
    where: { published: true, rating: { gte: 4 } },
    include: { product: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <section className="grid min-h-[calc(100vh-108px)] lg:grid-cols-2">
        <div className="flex flex-col justify-end px-5 py-12 lg:px-14 lg:py-16">
          <p className="eyebrow">Seravia Lifesciences</p>
          <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl">
            Doctor&apos;s science.
            <span className="mt-1 block italic text-sage">Indian skin.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink/80">
            Founded by a dermatologist. Formulated for pigmentation, acne, tanning, sensitivity and the climate those concerns live in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn">Shop the range</Link>
            <Link href="/routine" className="btn-line">Find your routine</Link>
          </div>
          <p className="mt-10 text-xs uppercase tracking-[0.16em] text-stone">
            Fragrance-free · Concentrations disclosed · Free shipping above ₹499
          </p>
        </div>
        <div className="relative flex items-end justify-center gap-2 bg-sand px-6 pb-10 pt-16 sm:gap-6">
          {hero.map((product, index) => (
            <Link
              key={product.slug}
              href={`/shop/${product.slug}`}
              className={index === 1 ? "-mt-10" : "mt-8"}
            >
              <Bottle accent={product.accent} mark={product.mark} size={index === 1 ? 280 : 220} title={product.name} />
              <p className="mt-2 text-center text-xs">{product.mark}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="page py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Shop by concern</p>
            <h2 className="mt-2 font-serif text-4xl tracking-tight">What Indian skin asks for most</h2>
          </div>
          <Link href="/shop" className="hidden text-sm underline sm:inline">All formulas</Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CONCERNS.map((concern) => {
            const count = products.filter((product) => product.concerns.includes(concern.slug)).length;
            return (
              <Link key={concern.slug} href={`/concern/${concern.slug}`} className="border border-line bg-ivory p-5 transition hover:border-ink">
                <p className="font-serif text-2xl tracking-tight">{concern.name}</p>
                <p className="mt-2 text-sm text-stone">{concern.line}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em]">{count} formulas</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="page pb-6">
        <p className="eyebrow">Our best sellers</p>
        <h2 className="mt-2 font-serif text-4xl tracking-tight">The formulas people finish</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={toCard(product)} />
          ))}
        </div>
      </section>

      <section className="mt-16 grid lg:grid-cols-2">
        <div className="bg-sage px-6 py-16 text-ivory lg:px-14">
          <p className="eyebrow text-ivory/60">The belief</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            Skincare should be guided by science, not just marketing.
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-ivory/80">
            Seravia Lifesciences was founded by a dermatologist to bring medical judgement, carefully chosen ingredients and clinically focused formulas to the concerns Indian skin actually meets: pigmentation, acne, sensitivity, tanning and premature ageing.
          </p>
          <Link href="/about" className="btn mt-8 bg-ivory text-ink hover:bg-sand">Read the science</Link>
        </div>
        <div className="grid sm:grid-cols-2">
          {principles.map((item) => (
            <article key={item.title} className="border border-line p-6">
              <h3 className="font-serif text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/75">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">From the desk</p>
            <h2 className="mt-2 font-serif text-4xl">Notes from people using the range</h2>
          </div>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {reviews.map((review) => (
            <blockquote key={review.id} className="border border-line bg-ivory p-5">
              <Stars value={review.rating} />
              <p className="mt-3 font-serif text-xl leading-snug">{review.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink/80">{review.body}</p>
              <footer className="mt-4 text-xs uppercase tracking-[0.14em] text-stone">
                {review.author} · {review.skinType} · {review.product.name}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="page pb-4">
        <div className="grid items-center gap-8 border border-line bg-sand px-6 py-10 md:grid-cols-[1.4fr_0.8fr] md:px-10">
          <div>
            <p className="eyebrow">Four steps, not fourteen</p>
            <h2 className="mt-2 font-serif text-4xl tracking-tight">A routine for your concern and your weather.</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/75">
              Answer four questions. Leave with a cleanser, a serum, a moisturiser and a sunscreen — chosen for Indian climate, not a generic quiz.
            </p>
            <Link href="/routine" className="btn mt-6">Build my routine</Link>
          </div>
          <p className="font-serif text-6xl italic leading-none text-sage md:text-right">AM / PM</p>
        </div>
      </section>
    </>
  );
}
