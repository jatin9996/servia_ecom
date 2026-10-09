"use client";

import { useState } from "react";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setMessage(data.error ?? "Could not send that.");
      return;
    }
    setMessage("Received. The desk will reply by email.");
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="border border-line bg-ivory p-5">
      <label className="label">Name</label>
      <input name="name" required className="field" />
      <label className="label mt-4">Email</label>
      <input name="email" type="email" required className="field" />
      <label className="label mt-4">Phone</label>
      <input name="phone" className="field" />
      <label className="label mt-4">Topic</label>
      <select name="topic" className="field">
        {["Order", "Ingredient question", "Routine help", "Wholesale", "Press"].map((topic) => (
          <option key={topic}>{topic}</option>
        ))}
      </select>
      <label className="label mt-4">Message</label>
      <textarea name="message" required className="field min-h-32" />
      {message ? <p className="mt-3 text-sm">{message}</p> : null}
      <button className="btn mt-4" disabled={pending}>{pending ? "Sending…" : "Send"}</button>
    </form>
  );
}
