import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession();
  if (!session || session.role !== "ADMIN") redirect("/login?next=/admin");
  return <AdminShell name={session.name}>{children}</AdminShell>;
}
