import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { toCard } from "@/lib/dto";
import { RoutineQuiz } from "@/components/routine/quiz";

export const metadata: Metadata = { title: "Find your routine" };

export default async function RoutinePage() {
  const products = await prisma.product.findMany({ where: { active: true } });
  return (
    <div className="page max-w-3xl py-14">
      <p className="eyebrow">Routine builder</p>
      <h1 className="mt-2 font-serif text-5xl tracking-tight">Tell us the day your skin actually has.</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink/75">
        Four questions. A cleanser, one treatment, a barrier cream and SPF 50. No 12-step plan.
      </p>
      <div className="mt-10">
        <RoutineQuiz products={products.map(toCard)} />
      </div>
    </div>
  );
}
