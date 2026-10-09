import { z } from "zod";
import { jsonError } from "@/lib/auth";
import { couponDiscount } from "@/lib/pricing";
import { findCoupon } from "@/server/checkout";

const schema = z.object({
  code: z.string().min(2),
  subtotal: z.number().nonnegative(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Enter a code.");
  const coupon = await findCoupon(parsed.data.code);
  if (!coupon) return jsonError("That code is not active.");
  if (couponDiscount(parsed.data.subtotal, coupon) <= 0) {
    return jsonError(`Add more to the bag. This code starts at ₹${coupon.minOrder}.`);
  }
  return Response.json({ coupon });
}
