"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type BagItem = {
  productId: string;
  slug: string;
  name: string;
  concernLine: string;
  price: number;
  mrp: number;
  qty: number;
  accent: string;
  mark: string;
  size: string;
  stock: number;
};

type CartContextValue = {
  items: BagItem[];
  ready: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  count: number;
  subtotal: number;
  add: (item: Omit<BagItem, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "seravia-bag";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw) as BagItem[]);
    } catch {
      localStorage.removeItem(KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    return {
      items,
      ready,
      open,
      setOpen,
      count,
      subtotal,
      add: (item, qty = 1) => {
        setItems((current) => {
          const existing = current.find((entry) => entry.productId === item.productId);
          if (!existing) return [...current, { ...item, qty: Math.min(qty, item.stock) }];
          const next = Math.min(existing.stock, existing.qty + qty);
          return current.map((entry) => (entry.productId === item.productId ? { ...entry, qty: next } : entry));
        });
        setOpen(true);
      },
      setQty: (productId, qty) => {
        setItems((current) =>
          current
            .map((entry) => (entry.productId === productId ? { ...entry, qty: Math.max(0, Math.min(entry.stock, qty)) } : entry))
            .filter((entry) => entry.qty > 0),
        );
      },
      remove: (productId) => setItems((current) => current.filter((entry) => entry.productId !== productId)),
      clear: () => setItems([]),
    };
  }, [items, open, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
