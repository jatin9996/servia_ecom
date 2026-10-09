import { createHmac, randomBytes } from "crypto";
import type { Coupon, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { quote, type CouponRule } from "@/lib/pricing";

export type AddressInput = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type CheckoutInput = {
  items: { productId: string; qty: number }[];
  email: string;
  address: AddressInput;
  note?: string;
  couponCode?: string;
  pointsToUse?: number;
  paymentMethod: "ONLINE" | "COD";
  userId?: string | null;
};

function asRule(coupon: Coupon | null): CouponRule | null {
  if (!coupon || !coupon.active) return null;
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) return null;
  if (coupon.type !== "PERCENT" && coupon.type !== "FLAT") return null;
  return { code: coupon.code, type: coupon.type, value: coupon.value, minOrder: coupon.minOrder };
}

export async function findCoupon(code?: string) {
  if (!code) return null;
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  return asRule(coupon);
}

export function orderNumber() {
  return `SRV-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

async function razorpayOrder(amountInRupees: number, receipt: string) {
  const Razorpay = (await import("razorpay")).default;
  const client = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });
  const created = await client.orders.create({
    amount: amountInRupees * 100,
    currency: "INR",
    receipt,
  });
  return created.id;
}

export async function placeOrder(input: CheckoutInput) {
  if (!input.items.length) throw new Error("Your bag is empty.");
  const ids = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true } });
  const byId = new Map(products.map((product) => [product.id, product]));

  const lines = input.items.map((item) => {
    const product = byId.get(item.productId);
    const qty = Math.floor(item.qty);
    if (!product || qty < 1) throw new Error("A product in your bag is no longer available.");
    if (qty > product.stock) throw new Error(`${product.name} has only ${product.stock} left.`);
    return { product, qty, price: product.price };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const coupon = await findCoupon(input.couponCode);
  if (input.couponCode && !coupon) throw new Error("That code is not active.");

  const user = input.userId ? await prisma.user.findUnique({ where: { id: input.userId } }) : null;
  const available = user?.points ?? 0;
  const priced = quote({
    subtotal,
    coupon,
    pointsRequested: user ? input.pointsToUse ?? 0 : 0,
    pointsAvailable: available,
  });

  const number = orderNumber();
  const online = input.paymentMethod === "ONLINE";
  let razorpayOrderId: string | null = null;
  if (online && razorpayConfigured()) {
    razorpayOrderId = await razorpayOrder(priced.total, number);
  }

  const order = await prisma.$transaction(async (tx) => {
    for (const line of lines) {
      const updated = await tx.product.updateMany({
        where: { id: line.product.id, stock: { gte: line.qty } },
        data: { stock: { decrement: line.qty } },
      });
      if (updated.count !== 1) throw new Error(`${line.product.name} just sold out.`);
    }

    if (user && priced.pointsUsed > 0) {
      const moved = await tx.user.updateMany({
        where: { id: user.id, points: { gte: priced.pointsUsed } },
        data: { points: { decrement: priced.pointsUsed } },
      });
      if (moved.count !== 1) throw new Error("Seravia Points could not be applied.");
    }

    return tx.order.create({
      data: {
        orderNumber: number,
        userId: user?.id,
        email: input.email,
        status: online ? "PENDING" : "CONFIRMED",
        paymentMethod: online ? "RAZORPAY" : "COD",
        paymentStatus: online ? "PENDING" : "COD",
        razorpayOrderId,
        subtotal,
        discount: priced.discount,
        pointsUsed: priced.pointsUsed,
        shipping: priced.shipping,
        total: priced.total,
        pointsEarned: user ? priced.pointsEarned : 0,
        pointsCredited: Boolean(!online && user && priced.pointsEarned > 0),
        couponCode: coupon?.code,
        note: input.note,
        address: input.address as unknown as Prisma.InputJsonValue,
        items: {
          create: lines.map((line) => ({
            productId: line.product.id,
            name: line.product.name,
            price: line.price,
            qty: line.qty,
          })),
        },
      },
      include: { items: true },
    });
  });

  if (user && !online && priced.pointsEarned > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: priced.pointsEarned } },
    });
  }

  return {
    order,
    mode: online ? (razorpayConfigured() ? "razorpay" : "demo") : "cod",
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
    amount: priced.total * 100,
    currency: "INR",
  };
}

export async function markPaid(orderNumber: string, paymentId: string) {
  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) throw new Error("Order not found.");
  if (order.paymentStatus === "PAID") return order;
  if (order.status === "CANCELLED") throw new Error("This order was cancelled.");

  const claimed = await prisma.order.updateMany({
    where: { orderNumber, paymentStatus: "PENDING", status: { not: "CANCELLED" } },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
      razorpayPaymentId: paymentId,
      pointsCredited: order.pointsEarned > 0,
    },
  });
  if (claimed.count === 1 && order.userId && order.pointsEarned > 0) {
    await prisma.user.update({
      where: { id: order.userId },
      data: { points: { increment: order.pointsEarned } },
    });
  }
  return prisma.order.findUnique({ where: { orderNumber } });
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return expected === signature;
}

export async function restoreOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.status === "CANCELLED") return;
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.qty } } });
    }
    if (order.userId && order.pointsUsed > 0) {
      await tx.user.update({ where: { id: order.userId }, data: { points: { increment: order.pointsUsed } } });
    }
    if (order.userId && order.pointsCredited && order.pointsEarned > 0) {
      const user = await tx.user.findUnique({ where: { id: order.userId } });
      const next = Math.max(0, (user?.points ?? 0) - order.pointsEarned);
      await tx.user.update({ where: { id: order.userId }, data: { points: next } });
    }
    await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : "CANCELLED" },
    });
  });
}
