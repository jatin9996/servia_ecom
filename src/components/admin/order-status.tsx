"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrderStatus({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [message, setMessage] = useState("");

  async function save(next: string) {
    setValue(next);
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const data = (await response.json()) as { error?: string };
    setMessage(response.ok ? "Updated." : data.error ?? "Could not update.");
    router.refresh();
  }

  return (
    <div>
      <label className="label">Move order</label>
      <select className="field max-w-xs" value={value} onChange={(event) => void save(event.target.value)}>
        {statuses.map((item) => <option key={item}>{item}</option>)}
      </select>
      {message ? <p className="mt-2 text-sm text-stone">{message}</p> : null}
      <p className="mt-2 text-xs text-stone">Cancelling restores stock and any points used on the order.</p>
    </div>
  );
}
