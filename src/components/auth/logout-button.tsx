"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";

export function LogoutButton() {
  const router = useRouter();
  const { refresh } = useAuth();
  return (
    <button
      type="button"
      className="btn-line"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        await refresh();
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
