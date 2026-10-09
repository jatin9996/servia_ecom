import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="page grid gap-10 py-14 lg:grid-cols-2">
      <div>
        <p className="eyebrow">The desk</p>
        <h1 className="mt-2 font-serif text-5xl tracking-tight">Ask about an order, an ingredient, or a routine.</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/75">
          For medical treatment, please see a dermatologist in person. This desk can help you choose among Seravia formulas and sort an order.
        </p>
        <p className="mt-6 text-sm">care@seravia.life</p>
        <p className="text-sm text-stone">Weekdays, 10:00–18:00 IST</p>
      </div>
      <ContactForm />
    </div>
  );
}
