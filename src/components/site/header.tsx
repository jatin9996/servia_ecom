"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONCERNS } from "@/lib/catalog";
import { Logo } from "@/components/site/logo";
import { useCart } from "@/components/cart/cart-context";
import { useAuth } from "@/components/auth/auth-context";

export function Header() {
  const { count, setOpen } = useCart();
  const { user } = useAuth();
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function search(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    setMenu(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="bg-sage text-center text-[12px] tracking-wide text-ivory">
        <p className="px-4 py-2">Doctor-formulated for Indian skin · Free shipping above ₹499 · Use WELCOME10</p>
      </div>
      <div className="page relative flex h-[72px] items-center justify-between gap-4">
        <button type="button" className="text-sm lg:hidden" onClick={() => setMenu((value) => !value)} aria-label="Menu">
          Menu
        </button>
        <nav className="hidden items-center gap-6 text-sm lg:flex">
          <Link href="/shop">Shop</Link>
          <div className="group relative">
            <Link href="/shop">Concerns</Link>
            <div className="invisible absolute left-0 top-full z-20 w-72 border border-line bg-ivory p-3 opacity-0 shadow-sheet transition group-hover:visible group-hover:opacity-100">
              {CONCERNS.map((concern) => (
                <Link key={concern.slug} href={`/concern/${concern.slug}`} className="block px-2 py-2 hover:bg-sand">
                  <span className="block text-sm">{concern.name}</span>
                  <span className="block text-xs text-stone">{concern.line}</span>
                </Link>
              ))}
            </div>
          </div>
          <Link href="/routine">Routine</Link>
          <Link href="/ingredients">Ingredients</Link>
          <Link href="/about">Our science</Link>
        </nav>
        <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <Logo />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <form onSubmit={search} className="hidden md:block">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search formulas"
              className="w-36 border-b border-line bg-transparent py-1 text-sm outline-none placeholder:text-stone focus:border-ink lg:w-44"
              aria-label="Search"
            />
          </form>
          <Link href={user ? "/account" : "/login"} className="hidden sm:inline">
            {user ? user.name.split(" ")[0] : "Account"}
          </Link>
          {user ? <span className="hidden text-xs text-stone md:inline">{user.points} pts</span> : null}
          <button type="button" onClick={() => setOpen(true)} className="relative">
            Bag
            <span className="ml-1 text-xs text-stone">{count}</span>
          </button>
        </div>
      </div>
      {menu ? (
        <div className="border-t border-line bg-paper px-5 py-4 lg:hidden">
          <form onSubmit={search} className="mb-4">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search formulas" className="field" />
          </form>
          <div className="grid gap-3 text-sm">
            <Link href="/shop" onClick={() => setMenu(false)}>Shop</Link>
            {CONCERNS.map((concern) => (
              <Link key={concern.slug} href={`/concern/${concern.slug}`} onClick={() => setMenu(false)}>
                {concern.name}
              </Link>
            ))}
            <Link href="/routine" onClick={() => setMenu(false)}>Routine</Link>
            <Link href="/ingredients" onClick={() => setMenu(false)}>Ingredients</Link>
            <Link href="/about" onClick={() => setMenu(false)}>Our science</Link>
            <Link href={user ? "/account" : "/login"} onClick={() => setMenu(false)}>
              {user ? "Account" : "Sign in"}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
