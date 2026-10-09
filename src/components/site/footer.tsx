import Link from "next/link";
import { CONCERNS } from "@/lib/catalog";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-ink text-ivory">
      <div className="page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-serif text-3xl">Seravia</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory/75">
            Doctor-owned. Doctor-formulated. Made for Indian skin.
          </p>
          <p className="mt-4 text-sm text-ivory/75">Seravia — Doctor’s Science. Indian Skin. Trusted Care.</p>
        </div>
        <div>
          <p className="eyebrow text-ivory/50">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/shop">All formulas</Link></li>
            {CONCERNS.map((concern) => (
              <li key={concern.slug}><Link href={`/concern/${concern.slug}`}>{concern.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-ivory/50">Care</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/routine">Find your routine</Link></li>
            <li><Link href="/ingredients">Ingredient index</Link></li>
            <li><Link href="/about">Why Seravia</Link></li>
            <li><Link href="/contact">Ask the desk</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-ivory/50">Help</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/shipping">Shipping</Link></li>
            <li><Link href="/returns">Returns</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/login">Account</Link></li>
          </ul>
          <p className="mt-6 text-sm text-ivory/70">care@seravia.life</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="page py-4 text-xs leading-relaxed text-ivory/55">
          Seravia products are cosmetics. They are not medicines and are not intended to diagnose, treat or cure any disease.
          Patch-test before use. If you are pregnant, nursing, or under a dermatologist’s care, ask them before starting actives such as retinol or acids.
        </p>
      </div>
    </footer>
  );
}
