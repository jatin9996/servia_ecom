"use client";

import Link from "next/link";
import { inr, shippingFor, FREE_SHIPPING_AT } from "@/lib/pricing";
import { useCart } from "@/components/cart/cart-context";
import { Bottle } from "@/components/product/bottle";

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal } = useCart();
  const shipping = shippingFor(subtotal);
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-ink/40" aria-label="Close bag" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-sheet">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-serif text-2xl">Your bag</h2>
          <button type="button" onClick={() => setOpen(false)} className="text-sm tracking-wide">
            Close
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="pt-10">
              <p className="font-serif text-3xl">The bag is empty.</p>
              <p className="mt-3 text-sm text-stone">Start with a concern, or build a four-step routine.</p>
              <Link href="/shop" onClick={() => setOpen(false)} className="btn mt-6">
                Shop the range
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="grid grid-cols-[72px_1fr] gap-3 border-b border-line pb-5">
                <div className="grid place-items-center bg-sand">
                  <Bottle accent={item.accent} mark={item.mark} size={92} />
                </div>
                <div>
                  <Link href={`/shop/${item.slug}`} onClick={() => setOpen(false)} className="font-medium leading-tight">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-stone">{item.size}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex border border-line">
                      <button type="button" className="px-2 py-1" onClick={() => setQty(item.productId, item.qty - 1)} aria-label="Decrease">
                        −
                      </button>
                      <span className="grid w-7 place-items-center text-sm">{item.qty}</span>
                      <button type="button" className="px-2 py-1" onClick={() => setQty(item.productId, item.qty + 1)} aria-label="Increase">
                        +
                      </button>
                    </div>
                    <span className="text-sm">{inr(item.price * item.qty)}</span>
                  </div>
                  <button type="button" className="mt-2 text-xs text-stone underline" onClick={() => remove(item.productId)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 ? (
          <div className="border-t border-line px-5 py-5">
            <p className="text-sm text-stone">
              {remaining > 0 ? `Add ${inr(remaining)} more for free shipping.` : "Free shipping is applied."}
            </p>
            <div className="mt-3 flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{inr(subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-stone">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : inr(shipping)}</span>
            </div>
            <Link href="/checkout" onClick={() => setOpen(false)} className="btn mt-4 w-full">
              Checkout
            </Link>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
