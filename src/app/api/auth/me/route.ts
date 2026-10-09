import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";

export async function GET() {
  const session = await readSession();
  if (!session) return Response.json({ user: null });
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return Response.json({ user: null });
  return Response.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, points: user.points },
  });
}
