import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, readSession } from "@/lib/auth";

const schema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(80),
  body: z.string().trim().min(12).max(800),
  skinType: z.string().min(2),
  ageRange: z.string().min(2),
  concern: z.string().trim().min(2).max(60),
});

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return jsonError("Sign in to review.", 401);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Check the review.");

  const existing = await prisma.review.findFirst({
    where: { productId: parsed.data.productId, userId: session.sub },
  });
  if (existing) return jsonError("You have already reviewed this formula.");

  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order: { userId: session.sub, status: { not: "CANCELLED" }, paymentStatus: { in: ["PAID", "COD"] } },
    },
  });

  await prisma.review.create({
    data: {
      ...parsed.data,
      userId: session.sub,
      author: session.name,
      verified: Boolean(purchased),
      published: true,
    },
  });

  const stats = await prisma.review.aggregate({
    where: { productId: parsed.data.productId, published: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: { ratingAvg: stats._avg.rating ?? 0, ratingCount: stats._count },
  });

  return Response.json({ ok: true });
}
