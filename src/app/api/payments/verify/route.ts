import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/auth";
import { markPaid, verifyRazorpaySignature } from "@/server/checkout";

const schema = z.object({
  orderNumber: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Payment confirmation was incomplete.");
  const order = await prisma.order.findUnique({ where: { orderNumber: parsed.data.orderNumber } });
  if (!order || order.razorpayOrderId !== parsed.data.razorpay_order_id) return jsonError("Order does not match this payment.", 404);
  if (!verifyRazorpaySignature(parsed.data.razorpay_order_id, parsed.data.razorpay_payment_id, parsed.data.razorpay_signature)) {
    return jsonError("Payment signature did not match.", 400);
  }
  await markPaid(order.orderNumber, parsed.data.razorpay_payment_id);
  return Response.json({ ok: true });
}
