import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/auth";
import { markPaid, razorpayConfigured } from "@/server/checkout";

const schema = z.object({ orderNumber: z.string() });

export async function POST(request: Request) {
  if (razorpayConfigured()) return jsonError("Live Razorpay is configured. Sandbox pay is off.", 400);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Missing order.");
  const order = await prisma.order.findUnique({ where: { orderNumber: parsed.data.orderNumber } });
  if (!order) return jsonError("Order not found.", 404);
  if (order.paymentMethod !== "RAZORPAY") return jsonError("This order is not a prepaid order.");
  await markPaid(order.orderNumber, `pay_demo_${order.orderNumber}`);
  return Response.json({ ok: true });
}
