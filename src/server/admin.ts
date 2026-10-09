import { z } from "zod";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { restoreOrder } from "@/server/checkout";

export async function requireAdmin() {
  const session = await readSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export const productSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2).regex(/^[a-z0-9-]+$/),
  concernLine: z.string().trim().min(2),
  description: z.string().trim().min(12),
  howToUse: z.string().trim().min(12),
  doctorNote: z.string().trim().min(12),
  price: z.number().int().positive(),
  mrp: z.number().int().positive(),
  sku: z.string().trim().min(3),
  stock: z.number().int().nonnegative(),
  category: z.string().min(2),
  concerns: z.array(z.string()).min(1),
  skinTypes: z.array(z.string()).min(1),
  pairsWith: z.array(z.string()).default([]),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  mark: z.string().min(1),
  size: z.string().min(1),
  whenToUse: z.string().min(2),
  badge: z.string().optional().nullable(),
  featured: z.number().int().default(50),
  active: z.boolean().default(true),
  ingredients: z.array(z.object({
    name: z.string().min(2),
    concentration: z.string().min(1),
    benefit: z.string().min(4),
  })).min(1),
});

export async function saveProduct(input: z.infer<typeof productSchema>, id?: string) {
  const { ingredients, badge, ...data } = input;
  const payload = { ...data, badge: badge || null };
  if (id) {
    return prisma.product.update({
      where: { id },
      data: {
        ...payload,
        ingredients: {
          deleteMany: {},
          create: ingredients.map((ingredient, index) => ({ ...ingredient, sort: index })),
        },
      },
    });
  }
  return prisma.product.create({
    data: {
      ...payload,
      ingredients: { create: ingredients.map((ingredient, index) => ({ ...ingredient, sort: index })) },
    },
  });
}

const statuses: OrderStatus[] = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

export async function setOrderStatus(id: string, status: string) {
  if (!statuses.includes(status as OrderStatus)) throw new Error("Unknown status.");
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error("Order not found.");
  if (status === "CANCELLED") {
    await restoreOrder(order.id);
    return;
  }
  if (order.status === "CANCELLED") throw new Error("A cancelled order cannot be reopened.");
  await prisma.order.update({ where: { id }, data: { status: status as OrderStatus } });
}
