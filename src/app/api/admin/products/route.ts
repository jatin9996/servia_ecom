import { jsonError } from "@/lib/auth";
import { productSchema, requireAdmin, saveProduct } from "@/server/admin";

export async function POST(request: Request) {
  if (!(await requireAdmin())) return jsonError("Admin only.", 401);
  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Check the formula.");
  try {
    const product = await saveProduct(parsed.data);
    return Response.json({ id: product.id, slug: product.slug });
  } catch {
    return jsonError("Slug or SKU is already in use.");
  }
}
