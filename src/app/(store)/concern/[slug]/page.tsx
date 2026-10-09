import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { concernBySlug } from "@/lib/catalog";
import { toCard } from "@/lib/dto";
import { ProductCard } from "@/components/product/card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const concern = concernBySlug(slug);
  return { title: concern?.name ?? "Concern" };
}

export default async function ConcernPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const concern = concernBySlug(slug);
  if (!concern) notFound();
  const products = await prisma.product.findMany({
    where: { active: true, concerns: { has: slug } },
    orderBy: { featured: "asc" },
  });

  return (
    <div className="page py-12">
      <p className="eyebrow">Shop by concern</p>
      <h1 className="mt-2 max-w-3xl font-serif text-5xl tracking-tight">{concern.name}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/75">{concern.copy}</p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={toCard(product)} />
        ))}
      </div>
      <p className="mt-10 text-sm">
        Not sure where to start? <Link href="/routine" className="underline">Build a four-step routine</Link>.
      </p>
    </div>
  );
}
