"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CouponForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.get("code"),
        type: form.get("type"),
        value: Number(form.get("value")),
        minOrder: Number(form.get("minOrder")),
      }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Could not create the code.");
      return;
    }
    event.currentTarget.reset();
    setError("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 border border-line bg-ivory p-4 sm:grid-cols-5">
      <input name="code" required placeholder="CODE" className="field" />
      <select name="type" className="field">
        <option value="PERCENT">Percent</option>
        <option value="FLAT">Flat ₹</option>
      </select>
      <input name="value" type="number" required placeholder="Value" className="field" />
      <input name="minOrder" type="number" required placeholder="Min order" className="field" defaultValue={0} />
      <button className="btn">Add code</button>
      {error ? <p className="text-sm text-clay sm:col-span-5">{error}</p> : null}
    </form>
  );
}

export function CouponToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-xs underline"
      onClick={async () => {
        await fetch(`/api/admin/coupons/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !active }),
        });
        router.refresh();
      }}
    >
      {active ? "Pause" : "Activate"}
    </button>
  );
}
