"use client";

import { useRouter } from "next/navigation";

export function ReviewToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-xs underline"
      onClick={async () => {
        await fetch(`/api/admin/reviews/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ published: !published }),
        });
        router.refresh();
      }}
    >
      {published ? "Hide" : "Publish"}
    </button>
  );
}
