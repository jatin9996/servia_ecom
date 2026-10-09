"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const next = params.get("next") || "/account";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = (await response.json()) as { error?: string; user?: { role: string } };
    setPending(false);
    if (!response.ok) {
      setError(data.error ?? "Could not continue.");
      return;
    }
    await refresh();
    if (data.user?.role === "ADMIN" && (next === "/account" || next.startsWith("/admin"))) {
      router.push("/admin");
      return;
    }
    router.push(next);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md border border-line bg-ivory p-6">
      <h1 className="font-serif text-4xl">{mode === "login" ? "Sign in" : "Create an account"}</h1>
      <p className="mt-2 text-sm text-stone">
        {mode === "login" ? "Orders, points and saved addresses live here." : "Earn 5% back as Seravia Points on every order."}
      </p>
      {mode === "register" ? (
        <>
          <label className="label mt-5">Name</label>
          <input name="name" required className="field" />
        </>
      ) : null}
      <label className="label mt-4">Email</label>
      <input name="email" type="email" required className="field" />
      <label className="label mt-4">Password</label>
      <input name="password" type="password" required minLength={8} className="field" />
      {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}
      <button className="btn mt-5 w-full" disabled={pending}>
        {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </button>
      <p className="mt-4 text-sm">
        {mode === "login" ? (
          <>New here? <Link href="/register" className="underline">Create an account</Link></>
        ) : (
          <>Already have one? <Link href="/login" className="underline">Sign in</Link></>
        )}
      </p>
    </form>
  );
}
