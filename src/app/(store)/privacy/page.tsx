import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="page max-w-3xl py-14">
      <p className="eyebrow">Help</p>
      <h1 className="mt-2 font-serif text-5xl">Privacy</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/80">
        <p>We store the name, email, phone and address you give us to fulfil an order, and the reviews you choose to publish.</p>
        <p>Passwords are hashed. Payment card and UPI details are handled by Razorpay when live keys are set. Seravia does not store full card numbers.</p>
        <p>We do not sell personal data. Desk enquiries are visible only inside the admin panel.</p>
      </div>
    </article>
  );
}
