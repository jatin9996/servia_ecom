"use client";

import { useState } from "react";

export function IngredientList({
  ingredients,
}: {
  ingredients: { name: string; concentration: string; benefit: string }[];
}) {
  const [open, setOpen] = useState<string | null>(ingredients[0]?.name ?? null);
  return (
    <div className="border-t border-line">
      {ingredients.map((item) => {
        const expanded = open === item.name;
        return (
          <div key={item.name} className="border-b border-line">
            <button
              type="button"
              className="flex w-full items-center justify-between py-4 text-left"
              onClick={() => setOpen(expanded ? null : item.name)}
              aria-expanded={expanded}
            >
              <span>
                <span className="font-medium">{item.name}</span>
                <span className="ml-3 text-sm text-stone">{item.concentration}</span>
              </span>
              <span className="text-lg">{expanded ? "–" : "+"}</span>
            </button>
            {expanded ? <p className="pb-4 text-sm leading-relaxed text-ink/75">{item.benefit}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
