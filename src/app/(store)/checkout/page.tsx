import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await readSession();
  const address = session
    ? await prisma.address.findFirst({ where: { userId: session.sub }, orderBy: { isDefault: "desc" } })
    : null;

  return (
    <div className="page py-12">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-2 font-serif text-5xl tracking-tight">Delivery and payment</h1>
      <div className="mt-8">
        <CheckoutForm
          saved={
            address
              ? {
                  fullName: address.fullName,
                  phone: address.phone,
                  line1: address.line1,
                  line2: address.line2,
                  city: address.city,
                  state: address.state,
                  pincode: address.pincode,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
