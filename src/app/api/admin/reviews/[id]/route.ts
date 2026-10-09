import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/auth";
import { requireAdmin } from "@/server/admin";

const schema = z.object({ published: z.boolean() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return jsonError("Admin only.", 401);
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Missing status.");
  const review = await prisma.review.update({ where: { id }, data: { published: parsed.data.published } });
  const stats = await prisma.review.aggregate({
    where: { productId: review.productId, published: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: review.productId },
    data: { ratingAvg: stats._avg.rating ?? 0, ratingCount: stats._count },
  });
  return Response.json({ ok: true });
}
