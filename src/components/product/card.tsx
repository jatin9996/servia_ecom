import Link from "next/link";
import { inr } from "@/lib/pricing";
import { Bottle } from "@/components/product/bottle";
import { Stars } from "@/components/product/stars";
import { AddToBag } from "@/components/product/add-to-bag";
import type { BagItem } from "@/components/cart/cart-context";

export type CardProduct = Omit<BagItem, "qty"> & {
  badge: string | null;
  ratingAvg: number;
  ratingCount: number;
  category: string;
};

export function ProductCard({ product }: { product: CardProduct }) {
  return (
    <article className="flex h-full flex-col">
      <Link href={`/shop/${product.slug}`} className="group block">
        <div className="relative grid aspect-[4/5] place-items-center bg-sand">
          {product.badge ? (
            <span className="absolute left-3 top-3 bg-ivory px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-ink">
              {product.badge}
            </span>
          ) : null}
          <Bottle accent={product.accent} mark={product.mark} size={210} />
        </div>
        <p className="mt-4 text-[12px] text-stone">{product.concernLine}</p>
        <h3 className="mt-1 font-serif text-[1.35rem] leading-tight tracking-tight group-hover:underline">{product.name}</h3>
        <div className="mt-2">
          {product.ratingCount > 0 ? <Stars value={product.ratingAvg} count={product.ratingCount} /> : <span className="text-xs text-stone">New formula</span>}
        </div>
        <p className="mt-2 text-sm">
          <span>{inr(product.price)}</span>
          {product.mrp > product.price ? <span className="ml-2 text-stone line-through">{inr(product.mrp)}</span> : null}
        </p>
      </Link>
      <div className="mt-3">
        <AddToBag product={product} compact />
      </div>
    </article>
  );
}
