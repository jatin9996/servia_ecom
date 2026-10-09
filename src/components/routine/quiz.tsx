"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { inr } from "@/lib/pricing";
import { useCart, type BagItem } from "@/components/cart/cart-context";
import { Bottle } from "@/components/product/bottle";
import type { CardProduct } from "@/components/product/card";

const questions = [
  {
    key: "concern",
    prompt: "What do you most want to change?",
    options: [
      { id: "pigmentation", label: "Pigmentation, tan or marks" },
      { id: "acne", label: "Acne and congestion" },
      { id: "barrier", label: "Sensitivity and a tired barrier" },
      { id: "ageing", label: "Early lines and texture" },
      { id: "dehydration", label: "Tight, dehydrated skin" },
    ],
  },
  {
    key: "skin",
    prompt: "How does your skin behave by afternoon?",
    options: [
      { id: "Oily", label: "Shiny, especially the T-zone" },
      { id: "Dry", label: "Tight, sometimes flaky" },
      { id: "Combination", label: "Oily centre, dry cheeks" },
      { id: "Sensitive", label: "Stings or reddens easily" },
    ],
  },
  {
    key: "day",
    prompt: "Where does your skin spend the day?",
    options: [
      { id: "outdoor", label: "Mostly outdoors or on a bike" },
      { id: "office", label: "AC office, then a hot commute" },
      { id: "humid", label: "Humid city, monsoon-prone" },
      { id: "dry", label: "Dry heat, inland or north" },
    ],
  },
  {
    key: "tolerance",
    prompt: "How does your skin take actives?",
    options: [
      { id: "new", label: "I am new to acids and retinol" },
      { id: "steady", label: "I already use an active most nights" },
      { id: "reactive", label: "Strong formulas make me peel" },
    ],
  },
] as const;

const serumFor: Record<string, string> = {
  pigmentation: "tranexamic-3",
  acne: "salicylic-acid-2",
  barrier: "hyaluronic-2",
  ageing: "retinol-0-3",
  dehydration: "hyaluronic-2",
};

export function RoutineQuiz({ products }: { products: CardProduct[] }) {
  const { add } = useCart();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const routine = useMemo(() => {
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    const concern = answers.concern ?? "pigmentation";
    const reactive = answers.tolerance === "reactive" || answers.tolerance === "new";
    const serumSlug = concern === "ageing" && reactive ? "hyaluronic-2" : serumFor[concern];
    const slugs = ["amino-cleanser", serumSlug, "ceramide-barrier-cream", "spf-50-fluid"];
    return slugs.map((slug) => bySlug.get(slug)).filter((item): item is CardProduct => Boolean(item));
  }, [answers.concern, answers.tolerance, products]);

  if (step >= questions.length) {
    const total = routine.reduce((sum, item) => sum + item.price, 0);
    const note =
      answers.tolerance === "reactive"
        ? "Your skin is reactive, so the serum step is a humectant. Add an active only after two calm weeks."
        : answers.day === "outdoor"
          ? "You are outdoors. The sunscreen is the step that makes the rest worth buying."
          : "Cleanse, treat, moisturise, protect. That is the whole routine.";

    return (
      <div>
        <p className="eyebrow">Your routine</p>
        <h2 className="mt-2 font-serif text-4xl tracking-tight">Four steps. Morning and night.</h2>
        <p className="mt-3 max-w-xl text-sm text-ink/75">{note}</p>
        <div className="mt-8 grid gap-4">
          {routine.map((product, index) => (
            <div key={product.slug} className="grid grid-cols-[88px_1fr_auto] items-center gap-4 border border-line bg-ivory p-3">
              <div className="grid place-items-center bg-sand">
                <Bottle accent={product.accent} mark={product.mark} size={96} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone">Step {index + 1} · {product.size}</p>
                <Link href={`/shop/${product.slug}`} className="font-serif text-2xl">{product.name}</Link>
                <p className="text-sm text-stone">{product.concernLine}</p>
              </div>
              <p className="pr-2 text-sm">{inr(product.price)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="btn"
            onClick={() => routine.forEach((product) => add(product as Omit<BagItem, "qty">, 1))}
          >
            Add the routine · {inr(total)}
          </button>
          <button type="button" className="btn-line" onClick={() => { setStep(0); setAnswers({}); }}>
            Start again
          </button>
        </div>
      </div>
    );
  }

  const question = questions[step];
  return (
    <div>
      <p className="eyebrow">Question {step + 1} of {questions.length}</p>
      <h2 className="mt-2 font-serif text-4xl tracking-tight">{question.prompt}</h2>
      <div className="mt-8 grid gap-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            className="border border-line bg-ivory px-4 py-4 text-left text-sm transition hover:border-ink"
            onClick={() => {
              setAnswers((current) => ({ ...current, [question.key]: option.id }));
              setStep((value) => value + 1);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
