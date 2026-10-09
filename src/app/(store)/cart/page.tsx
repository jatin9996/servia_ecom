"use client";

import Link from "next/link";
import { inr, shippingFor, FREE_SHIPPING_AT } from "@/lib/pricing";
import { useCart } from "@/components/cart/cart-context";
import { Bottle } from "@/components/product/bottle";

export default function CartPage() {
  const { items, ready, setQty, remove, subtotal } = useCart();
  const shipping = shippingFor(subtotal);
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);

  if (!ready) return <div className="page py-16 text-sm text-stone">Opening your bag…</div>;

  return (
    <div className="page py-12">
      <h1 className="font-serif text-5xl tracking-tight">Bag</h1>
      {items.length === 0 ? (
        <div className="mt-8">
          <p className="text-ink/70">Nothing here yet.</p>
          <Link href="/shop" className="btn mt-6">Shop the range</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.7fr]">
          <div className="space-y-5">
            {items.map((item) => (
              <div key={item.productId} className="grid grid-cols-[96px_1fr] gap-4 border-b border-line pb-5">
                <div className="grid place-items-center bg-sand">
                  <Bottle accent={item.accent} mark={item.mark} size={110} />
                </div>
                <div>
                  <Link href={`/shop/${item.slug}`} className="font-serif text-2xl">{item.name}</Link>
                  <p className="text-sm text-stone">{item.concernLine}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex border border-line">
                      <button type="button" className="px-3 py-1" onClick={() => setQty(item.productId, item.qty - 1)}>−</button>
                      <span className="grid w-8 place-items-center text-sm">{item.qty}</span>
                      <button type="button" className="px-3 py-1" onClick={() => setQty(item.productId, item.qty + 1)}>+</button>
                    </div>
                    <span>{inr(item.price * item.qty)}</span>
                  </div>
                  <button type="button" className="mt-2 text-xs text-stone underline" onClick={() => remove(item.productId)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <aside className="h-fit border border-line bg-ivory p-5">
            <p className="text-sm text-stone">{remaining > 0 ? `Add ${inr(remaining)} for free shipping.` : "Shipping is free."}</p>
            <div className="mt-4 flex justify-between text-sm"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            <div className="mt-2 flex justify-between text-sm"><span>Shipping</span><span>{shipping ? inr(shipping) : "Free"}</span></div>
            <div className="mt-3 flex justify-between border-t border-line pt-3 font-medium"><span>Estimated total</span><span>{inr(subtotal + shipping)}</span></div>
            <Link href="/checkout" className="btn mt-5 w-full">Checkout</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
