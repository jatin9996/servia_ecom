import { jsonError } from "@/lib/auth";
import { productSchema, requireAdmin, saveProduct } from "@/server/admin";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return jsonError("Admin only.", 401);
  const { id } = await context.params;
  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Check the formula.");
  try {
    const product = await saveProduct(parsed.data, id);
    return Response.json({ id: product.id });
  } catch {
    return jsonError("Could not save. Slug or SKU may already exist.");
  }
}
