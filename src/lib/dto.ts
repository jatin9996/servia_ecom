import type { Product } from "@prisma/client";
import type { CardProduct } from "@/components/product/card";

export function toCard(product: Product): CardProduct {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    concernLine: product.concernLine,
    price: product.price,
    mrp: product.mrp,
    accent: product.accent,
    mark: product.mark,
    size: product.size,
    stock: product.stock,
    badge: product.badge,
    ratingAvg: product.ratingAvg,
    ratingCount: product.ratingCount,
    category: product.category,
  };
}
