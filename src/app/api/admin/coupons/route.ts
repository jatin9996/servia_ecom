import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/auth";
import { requireAdmin } from "@/server/admin";

const schema = z.object({
  code: z.string().trim().min(3).max(20),
  type: z.enum(["PERCENT", "FLAT"]),
  value: z.number().int().positive(),
  minOrder: z.number().int().nonnegative(),
});

export async function POST(request: Request) {
  if (!(await requireAdmin())) return jsonError("Admin only.", 401);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Check the code, type and value.");
  if (parsed.data.type === "PERCENT" && parsed.data.value > 60) return jsonError("Keep percentage codes at 60% or below.");
  try {
    const coupon = await prisma.coupon.create({
      data: { ...parsed.data, code: parsed.data.code.toUpperCase() },
    });
    return Response.json({ id: coupon.id });
  } catch {
    return jsonError("That code already exists.");
  }
}
