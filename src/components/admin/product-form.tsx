"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CONCERNS, SKIN_TYPES } from "@/lib/catalog";

type Ingredient = { name: string; concentration: string; benefit: string };

export type ProductFormValues = {
  name: string;
  slug: string;
  concernLine: string;
  description: string;
  howToUse: string;
  doctorNote: string;
  price: number;
  mrp: number;
  sku: string;
  stock: number;
  category: string;
  concerns: string[];
  skinTypes: string[];
  pairsWith: string;
  accent: string;
  mark: string;
  size: string;
  whenToUse: string;
  badge: string;
  featured: number;
  active: boolean;
  ingredients: Ingredient[];
};

const empty: ProductFormValues = {
  name: "",
  slug: "",
  concernLine: "",
  description: "",
  howToUse: "",
  doctorNote: "",
  price: 499,
  mrp: 599,
  sku: "",
  stock: 40,
  category: "serum",
  concerns: ["pigmentation"],
  skinTypes: ["Combination"],
  pairsWith: "",
  accent: "#1E3A32",
  mark: "10%",
  size: "30 ml",
  whenToUse: "AM + PM",
  badge: "",
  featured: 20,
  active: true,
  ingredients: [{ name: "", concentration: "", benefit: "" }],
};

export function ProductForm({ initial, id }: { initial?: ProductFormValues; id?: string }) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initial ?? empty);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch(id ? `/api/admin/products/${id}` : "/api/admin/products", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        badge: values.badge || null,
        pairsWith: values.pairsWith.split(",").map((item) => item.trim()).filter(Boolean),
        ingredients: values.ingredients.filter((item) => item.name && item.benefit),
      }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error ?? "Could not save.");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-4">
      <label className="label">Name</label>
      <input className="field" value={values.name} onChange={(event) => {
        const name = event.target.value;
        set("name", name);
        if (!id) set("slug", name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
      }} required />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Slug</label>
          <input className="field" value={values.slug} onChange={(event) => set("slug", event.target.value)} required />
        </div>
        <div>
          <label className="label">SKU</label>
          <input className="field" value={values.sku} onChange={(event) => set("sku", event.target.value)} required />
        </div>
      </div>
      <label className="label">Concern line</label>
      <input className="field" value={values.concernLine} onChange={(event) => set("concernLine", event.target.value)} required />
      <label className="label">Description</label>
      <textarea className="field min-h-24" value={values.description} onChange={(event) => set("description", event.target.value)} required />
      <label className="label">How to use</label>
      <textarea className="field min-h-24" value={values.howToUse} onChange={(event) => set("howToUse", event.target.value)} required />
      <label className="label">Doctor note</label>
      <textarea className="field min-h-24" value={values.doctorNote} onChange={(event) => set("doctorNote", event.target.value)} required />
      <div className="grid gap-3 sm:grid-cols-4">
        <div><label className="label">Price</label><input type="number" className="field" value={values.price} onChange={(event) => set("price", Number(event.target.value))} /></div>
        <div><label className="label">MRP</label><input type="number" className="field" value={values.mrp} onChange={(event) => set("mrp", Number(event.target.value))} /></div>
        <div><label className="label">Stock</label><input type="number" className="field" value={values.stock} onChange={(event) => set("stock", Number(event.target.value))} /></div>
        <div><label className="label">Featured</label><input type="number" className="field" value={values.featured} onChange={(event) => set("featured", Number(event.target.value))} /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Category</label>
          <select className="field" value={values.category} onChange={(event) => set("category", event.target.value)}>
            {CATEGORIES.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">When</label>
          <select className="field" value={values.whenToUse} onChange={(event) => set("whenToUse", event.target.value)}>
            {["AM", "PM", "AM + PM"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div><label className="label">Mark</label><input className="field" value={values.mark} onChange={(event) => set("mark", event.target.value)} /></div>
        <div><label className="label">Size</label><input className="field" value={values.size} onChange={(event) => set("size", event.target.value)} /></div>
        <div><label className="label">Accent</label><input className="field" value={values.accent} onChange={(event) => set("accent", event.target.value)} /></div>
        <div><label className="label">Badge</label><input className="field" value={values.badge} onChange={(event) => set("badge", event.target.value)} placeholder="Bestseller" /></div>
      </div>
      <fieldset>
        <legend className="label">Concerns</legend>
        <div className="flex flex-wrap gap-3 text-sm">
          {CONCERNS.map((concern) => (
            <label key={concern.slug} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={values.concerns.includes(concern.slug)}
                onChange={(event) => {
                  set("concerns", event.target.checked ? [...values.concerns, concern.slug] : values.concerns.filter((item) => item !== concern.slug));
                }}
              />
              {concern.name}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label">Skin types</legend>
        <div className="flex flex-wrap gap-3 text-sm">
          {SKIN_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={values.skinTypes.includes(type)}
                onChange={(event) => {
                  set("skinTypes", event.target.checked ? [...values.skinTypes, type] : values.skinTypes.filter((item) => item !== type));
                }}
              />
              {type}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="label">Pairs with (slugs, comma separated)</label>
      <input className="field" value={values.pairsWith} onChange={(event) => set("pairsWith", event.target.value)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.active} onChange={(event) => set("active", event.target.checked)} />
        Visible on the shop
      </label>
      <div>
        <div className="flex items-center justify-between">
          <p className="label">Ingredients</p>
          <button type="button" className="text-xs underline" onClick={() => set("ingredients", [...values.ingredients, { name: "", concentration: "", benefit: "" }])}>Add</button>
        </div>
        <div className="space-y-3">
          {values.ingredients.map((ingredient, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-3">
              <input className="field" placeholder="Name" value={ingredient.name} onChange={(event) => {
                const next = [...values.ingredients];
                next[index] = { ...ingredient, name: event.target.value };
                set("ingredients", next);
              }} />
              <input className="field" placeholder="Concentration" value={ingredient.concentration} onChange={(event) => {
                const next = [...values.ingredients];
                next[index] = { ...ingredient, concentration: event.target.value };
                set("ingredients", next);
              }} />
              <input className="field" placeholder="Why it is here" value={ingredient.benefit} onChange={(event) => {
                const next = [...values.ingredients];
                next[index] = { ...ingredient, benefit: event.target.value };
                set("ingredients", next);
              }} />
            </div>
          ))}
        </div>
      </div>
      {error ? <p className="text-sm text-clay">{error}</p> : null}
      <button className="btn w-fit" disabled={pending}>{pending ? "Saving…" : "Save formula"}</button>
    </form>
  );
}
