import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Our science" };

export default function AboutPage() {
  return (
    <article className="page max-w-3xl py-14">
      <p className="eyebrow">Seravia Lifesciences</p>
      <h1 className="mt-3 font-serif text-5xl leading-[1.02] tracking-tight">
        Doctor-owned. Doctor-formulated. Made for Indian skin.
      </h1>
      <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-ink/85">
        <p>Seravia Lifesciences was created with a simple belief: skincare should be guided by science, not just marketing.</p>
        <p>
          Founded by a dermatologist, Seravia brings medical expertise, carefully selected ingredients, and clinically focused formulations together to create skincare designed for the unique needs of Indian skin and climate.
        </p>
        <p>
          In India, where skin concerns such as pigmentation, acne, sensitivity, tanning and premature ageing are common, consumers deserve products developed with a doctor’s understanding of skin health.
        </p>
      </div>
      <h2 className="mt-12 font-serif text-3xl">What “for Indian skin” means here</h2>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink/80">
        <li>Melanin-rich skin that tans, marks and scars differently from the skin most global formulas were photographed on.</li>
        <li>Humidity that congests, air-conditioning that dehydrates, and hard water that leaves a tight feel after washing.</li>
        <li>Pollution and long commutes, which make daily sunscreen more useful than another night oil.</li>
        <li>A preference for short routines people will still be using in June.</li>
      </ul>
      <h2 className="mt-12 font-serif text-3xl">How a formula earns its place</h2>
      <p className="mt-4 text-sm leading-relaxed text-ink/80">
        Each product leads with a named active and a stated concentration. Textures are chosen for heat. Fragrance, essential oils and drying alcohols are left out. We do not publish miracle percentages. If a concern needs a prescription, a dermatologist in clinic is the right next step — a serum is not a substitute.
      </p>
      <p className="mt-10 font-serif text-2xl italic text-sage">Seravia — Doctor’s Science. Indian Skin. Trusted Care.</p>
      <Link href="/shop" className="btn mt-8">Shop the range</Link>
    </article>
  );
}
