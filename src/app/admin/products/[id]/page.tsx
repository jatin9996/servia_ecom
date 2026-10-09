import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { ingredients: { orderBy: { sort: "asc" } } },
  });
  if (!product) notFound();
  const initial: ProductFormValues = {
    name: product.name,
    slug: product.slug,
    concernLine: product.concernLine,
    description: product.description,
    howToUse: product.howToUse,
    doctorNote: product.doctorNote,
    price: product.price,
    mrp: product.mrp,
    sku: product.sku,
    stock: product.stock,
    category: product.category,
    concerns: product.concerns,
    skinTypes: product.skinTypes,
    pairsWith: product.pairsWith.join(", "),
    accent: product.accent,
    mark: product.mark,
    size: product.size,
    whenToUse: product.whenToUse,
    badge: product.badge ?? "",
    featured: product.featured,
    active: product.active,
    ingredients: product.ingredients.map((item) => ({
      name: item.name,
      concentration: item.concentration,
      benefit: item.benefit,
    })),
  };
  return (
    <div>
      <p className="eyebrow">Catalog</p>
      <h1 className="mt-2 font-serif text-4xl">{product.name}</h1>
      <div className="mt-6">
        <ProductForm initial={initial} id={product.id} />
      </div>
    </div>
  );
}
