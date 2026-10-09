import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/auth";
import { requireAdmin } from "@/server/admin";

const schema = z.object({ active: z.boolean() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return jsonError("Admin only.", 401);
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Missing status.");
  await prisma.coupon.update({ where: { id }, data: { active: parsed.data.active } });
  return Response.json({ ok: true });
}
