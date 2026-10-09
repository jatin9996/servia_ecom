import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  topic: z.string().min(2),
  message: z.string().trim().min(8).max(2000),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Add your name, email and a short message.");
  await prisma.inquiry.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone || null,
      topic: parsed.data.topic,
      message: parsed.data.message,
    },
  });
  return Response.json({ ok: true });
}
