"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SKIN_TYPES } from "@/lib/catalog";
import { useAuth } from "@/components/auth/auth-context";

export function ReviewForm({ productId }: { productId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  if (!user) {
    return (
      <div className="border border-line p-5">
        <h3 className="font-serif text-2xl">Write a note</h3>
        <p className="mt-2 text-sm text-stone">Sign in to review a formula you have used.</p>
        <Link href="/login?next=/shop" className="btn mt-4">Sign in</Link>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        rating: Number(form.get("rating")),
        title: form.get("title"),
        body: form.get("body"),
        skinType: form.get("skinType"),
        ageRange: form.get("ageRange"),
        concern: form.get("concern"),
      }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setMessage(data.error ?? "Could not publish that note.");
      return;
    }
    setMessage("Published. Thank you.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="border border-line bg-ivory p-5">
      <h3 className="font-serif text-2xl">Write a note</h3>
      <label className="label mt-4">Rating</label>
      <select name="rating" className="field" defaultValue="5">
        {[5, 4, 3, 2, 1].map((value) => (
          <option key={value} value={value}>{value} star{value > 1 ? "s" : ""}</option>
        ))}
      </select>
      <label className="label mt-4">Title</label>
      <input name="title" required className="field" maxLength={80} />
      <label className="label mt-4">Your experience</label>
      <textarea name="body" required className="field min-h-28" maxLength={800} />
      <label className="label mt-4">Skin type</label>
      <select name="skinType" className="field">
        {SKIN_TYPES.map((type) => <option key={type}>{type}</option>)}
      </select>
      <label className="label mt-4">Age range</label>
      <select name="ageRange" className="field">
        {["18–24", "25–34", "35–44", "45+"].map((range) => <option key={range}>{range}</option>)}
      </select>
      <label className="label mt-4">Concern</label>
      <input name="concern" required className="field" placeholder="Pigmentation, acne, barrier…" />
      {message ? <p className="mt-3 text-sm">{message}</p> : null}
      <button className="btn mt-4" disabled={pending}>{pending ? "Publishing…" : "Publish note"}</button>
    </form>
  );
}
