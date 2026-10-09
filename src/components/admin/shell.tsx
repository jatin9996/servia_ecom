"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/site/logo";
import { LogoutButton } from "@/components/auth/logout-button";

const links = [
  ["/admin", "Desk"],
  ["/admin/orders", "Orders"],
  ["/admin/products", "Formulas"],
  ["/admin/customers", "Customers"],
  ["/admin/coupons", "Codes"],
  ["/admin/reviews", "Reviews"],
  ["/admin/inquiries", "Inbox"],
];

export function AdminShell({ name, children }: { name: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[230px_1fr]">
      <aside className="border-b border-line bg-ivory lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="px-5 py-5">
          <Logo />
          <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-stone">Formulation desk</p>
        </div>
        <nav className="flex gap-1 overflow-auto px-3 pb-4 lg:block lg:space-y-1 lg:px-3">
          {links.map(([href, label]) => {
            const active = ready && (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`block whitespace-nowrap px-3 py-2 text-sm ${active ? "bg-ink text-ivory" : "hover:bg-sand"}`}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-5 py-6 lg:block">
          <p className="text-sm">{name}</p>
          <div className="mt-3"><LogoutButton /></div>
          <Link href="/" className="mt-4 block text-xs text-stone underline">View the shop</Link>
        </div>
      </aside>
      <div className="px-5 py-8 lg:px-10">{children}</div>
    </div>
  );
}
