import type { Metadata } from "next";

export const metadata: Metadata = { title: "Returns" };

export default function ReturnsPage() {
  return (
    <article className="page max-w-3xl py-14">
      <p className="eyebrow">Help</p>
      <h1 className="mt-2 font-serif text-5xl">Returns</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/80">
        <p>Unopened products can be returned within 7 days of delivery. Write to care@seravia.life with your order number.</p>
        <p>Opened skincare cannot be resold, so we do not accept returns on used bottles unless the product arrived damaged or incorrect. Photograph the parcel and we will replace it.</p>
        <p>Prepaid refunds go back to the original method. Seravia Points used on a cancelled order are restored to the account.</p>
      </div>
    </article>
  );
}
