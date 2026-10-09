"use client";

import { useState } from "react";
import { useCart, type BagItem } from "@/components/cart/cart-context";

export function AddToBag({
  product,
  compact = false,
}: {
  product: Omit<BagItem, "qty">;
  compact?: boolean;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const soldOut = product.stock < 1;

  if (compact) {
    return (
      <button
        type="button"
        className="btn w-full"
        disabled={soldOut}
        onClick={() => add(product, 1)}
      >
        {soldOut ? "Sold out" : "Add to bag"}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex border border-line">
          <button type="button" className="px-3 py-3" onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
            −
          </button>
          <span className="grid w-10 place-items-center text-sm">{qty}</span>
          <button
            type="button"
            className="px-3 py-3"
            onClick={() => setQty((value) => Math.min(product.stock, value + 1))}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="btn flex-1"
          disabled={soldOut}
          onClick={() => {
            add(product, qty);
            setNote("Added to your bag");
          }}
        >
          {soldOut ? "Sold out" : "Add to bag"}
        </button>
      </div>
      {product.stock > 0 && product.stock < 8 ? (
        <p className="text-xs text-clay">Only {product.stock} left in this batch.</p>
      ) : null}
      {note ? <p className="text-sm text-moss">{note}</p> : null}
    </div>
  );
}
