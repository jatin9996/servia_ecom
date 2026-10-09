import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, readSession } from "@/lib/auth";
import { placeOrder } from "@/server/checkout";

const schema = z.object({
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().positive() })).min(1),
  email: z.string().email(),
  note: z.string().max(240).optional().nullable(),
  couponCode: z.string().max(40).optional().nullable(),
  pointsToUse: z.number().int().nonnegative().optional(),
  paymentMethod: z.enum(["ONLINE", "COD"]),
  address: z.object({
    fullName: z.string().trim().min(2),
    phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number."),
    line1: z.string().trim().min(4),
    line2: z.string().trim().optional().nullable(),
    city: z.string().trim().min(2),
    state: z.string().trim().min(2),
    pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit pincode."),
  }),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message ?? "Check the delivery details.";
    return jsonError(issue);
  }
  const session = await readSession();
  try {
    const result = await placeOrder({
      ...parsed.data,
      email: parsed.data.email.toLowerCase(),
      note: parsed.data.note ?? undefined,
      couponCode: parsed.data.couponCode ?? undefined,
      address: {
        ...parsed.data.address,
        line2: parsed.data.address.line2 ?? undefined,
      },
      userId: session?.sub,
    });

    if (session) {
      const address = parsed.data.address;
      const existing = await prisma.address.findFirst({
        where: { userId: session.sub, line1: address.line1, pincode: address.pincode },
      });
      if (!existing) {
        await prisma.address.updateMany({ where: { userId: session.sub }, data: { isDefault: false } });
        await prisma.address.create({
          data: {
            userId: session.sub,
            fullName: address.fullName,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            isDefault: true,
          },
        });
      }
    }

    return Response.json({
      orderNumber: result.order.orderNumber,
      mode: result.mode,
      key: result.key,
      amount: result.amount,
      currency: result.currency,
      razorpayOrderId: result.order.razorpayOrderId,
      total: result.order.total,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Checkout failed.");
  }
}
