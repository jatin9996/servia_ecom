import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="page py-14">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
      <p className="mt-6 max-w-md text-xs text-stone">
        Desk login: admin@seravia.life · Customer sample: mira@seravia.life
      </p>
    </div>
  );
}
