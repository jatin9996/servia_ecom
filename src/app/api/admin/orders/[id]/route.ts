import { z } from "zod";
import { jsonError } from "@/lib/auth";
import { requireAdmin, setOrderStatus } from "@/server/admin";

const schema = z.object({ status: z.string() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return jsonError("Admin only.", 401);
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Choose a status.");
  try {
    await setOrderStatus(id, parsed.data.status);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not update the order.");
  }
}
